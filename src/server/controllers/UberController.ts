import { Express, Request, Response, RequestHandler } from "express";
import { DefaultController } from "./DefaultController";
import * as http from "request-promise-native";
import { uniq, difference } from 'lodash';
import { UberTokenAuthenticationException, UberLogoutFailureException, UberRideHistoryFailureHistoryException, ErrorType } from "../models/errors";
import { IRideProduct, RideProduct } from '../models/RideProducts';
import { Ride, IRide } from "../models/Rides";
import * as NodeCache from 'node-cache';
import { Options } from 'node-cache';

export interface IUberControllerSettings {
    clientId: string;
    clientSecret: string;
    redirectHost: string;
}

export interface IRidesWithProducts {
    rides: IRide[];
    products: IRideProduct[];
}

export interface IRideHistory {
    offset: number;
    limit: number;
    count: number;
    history: IRide[];
}

export class UberController extends DefaultController {
    
    private readonly historyCache: NodeCache;
    private readonly API_MAX_RIDE_LIMIT = 50;

    constructor(private settings: IUberControllerSettings) {
        super();
        this.historyCache = new NodeCache();
    }
    
    registerRoutes(subApp: Express) {
        subApp.post('/token', this.acquireToken);
        subApp.post('/logout', this.revokeToken);
        subApp.get('/me', this.getUserProfile);
        subApp.get('/history', this.getRideHistory);
    }
    
    private static uberHeaders(token: string) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept-Language': 'en_US'
        };
    }
    
    acquireToken: RequestHandler = (req: Request, res: Response): any => {
        console.log('acquiring access token');
        
        http({
            method: 'POST',
            uri: 'https://login.uber.com/oauth/v2/token',
            json: true,
            formData: {
                client_id: this.settings.clientId,
                client_secret: this.settings.clientSecret,
                redirect_uri: this.settings.redirectHost, // must match what's in the uber_dashboard
                grant_type: 'authorization_code',
                scope: 'history+profile',
                code: req.body.authorizationCode
            } // must be form - it's url-encoded data
        })
        .then((json: any) => res.json({ accessToken: json.access_token }))
        .catch(_ => UberTokenAuthenticationException.send(res));    
    }
    
    revokeToken = (req: Request, res: Response) => {
        console.log('Logging out user...');
        http({
            method: 'POST',
            uri: 'https://login.uber.com/oauth/v2/revoke',
            json: true,
            formData: {
                client_secret: this.settings.clientSecret,
                client_id: this.settings.clientId,
                token: req.body.accessToken
            } // must be form - it's url-encoded data
        })
        .then((json: any) => res.send(true))
        .catch(_ => UberLogoutFailureException.send(res));
    }
    
    retrieveRideProductAsync = async (token: string, productId: string): Promise<IRideProduct> => {
        const productDetails: IRideProduct = await http({
            method: 'GET',
            uri: `https://api.uber.com/v1.2/products/${productId}`,
            json: true,
            headers: UberController.uberHeaders(token)
        });
        return new RideProduct(productDetails);
    }
    
    retrieveRideProducts = async (token: string, productIds: string[]) => {
        return Promise.all(productIds.map(p => this.retrieveRideProductAsync(token, p)));
    }
    
    retrieveRideHistoryAsync = async (token: string, limit: number, offset: number, userId: string, res: Response): Promise<IRideHistory> => {
        limit = limit || this.API_MAX_RIDE_LIMIT;
        return http({
            method: 'GET', 
            uri: 'https://api.uber.com/v1.2/history',
            json: true, // Automatically parses the JSON string in the response
            qs: { limit: Math.min(this.API_MAX_RIDE_LIMIT, limit), offset: offset },
            headers: UberController.uberHeaders(token)
        }).then((response: any) => {
            console.log('Retrieved ' + response.history.length + ' rides');
            response.history = response.history.map((r: IRide) => {
                r.user_id = userId;
                return new Ride(r);
            });
            return response;
        }).catch(_ => {
            console.log('Retrieving ride history failed with args: ', token, limit, offset, userId);
            UberRideHistoryFailureHistoryException.send(res)
        });
    }
    
    /**
    * Retrieves rides recursively from the User History API.
    * If totalRides is `undefined`, all ride history will be retrieved.
    * https://stackoverflow.com/questions/35139145/retrieve-paginated-data-recursively-using-promises
    * @param {string} token
    */
    retrieveRideHistory = async (token: string, totalRides: number, ridesArr: IRide[], userId: string, res: Response) => {
        const rides: IRideHistory = await this.retrieveRideHistoryAsync(token, totalRides, ridesArr.length, userId, res);
        console.log(`Successfully retrieved ride history: ${rides.history.length} rides`);
        if (rides.history.length) {
            ridesArr = ridesArr.concat(rides.history);
        }
        totalRides = totalRides - rides.history.length;
        if (totalRides > 0) {
            return this.retrieveRideHistory(token, totalRides, ridesArr, userId, res);
        }
        return ridesArr;
    }
    
    getProductsForRides = async (token: string, rides: IRide[]): Promise<IRidesWithProducts> => {
        // Product IDs are sometimes null
        const allProductIds = uniq(rides.map(r => r.product_id).filter(id => !!id));
        
        let cachedProducts: IRideProduct[] = await RideProduct.find({ product_id: { $in: allProductIds }}).exec();
        cachedProducts = cachedProducts.map(p => new RideProduct(p));
        if (allProductIds.length === cachedProducts.length) {
            // We already have all ride products stored
            console.log(`All ${cachedProducts.length} products already cached.`);
            return this.filterToValidRidesWithProducts(rides, cachedProducts);
        }
        // Else, return the ones we have plus the ones we now retrieve (and store).
        console.log('Retrieving new products.');
        const cachedIds = cachedProducts.map(r => r.product_id);
        const notYetStoredIds = difference(allProductIds, cachedIds);
        const retrievedProducts = await this.retrieveRideProducts(token, notYetStoredIds);
        return { rides: rides, products: retrievedProducts.concat(cachedProducts) };
    }
    
    storeRides = async (rides: IRide[]): Promise<IRide[]> => {
        return Ride.insertMany(rides, { ordered: false }).catch((reason: any) => {
            return Promise.resolve([]);
        });
    }

    storeProducts = async (rideProducts: IRideProduct[]): Promise<IRideProduct[]> => {
        return RideProduct.insertMany(rideProducts, { ordered: false }).catch((reason: any) => {
            return Promise.resolve([]);
        });
    }

    sendAllRideHistoryAndProducts = async (res: Response, token: string, userId: string): Promise<void> => {
        let retrievedRides: IRide[] = await this.retrieveRideHistory(token, this.API_MAX_RIDE_LIMIT, [], userId, res);
        let validRidesWithProducts: IRidesWithProducts = await this.getProductsForRides(token, retrievedRides);
        
        res.send(validRidesWithProducts);
        
        this.setCachedRideHistory(userId, validRidesWithProducts);
        await this.storeRides(validRidesWithProducts.rides);
        await this.storeProducts(validRidesWithProducts.products);
    }

    filterToValidRidesWithProducts = (rides: IRide[], products: IRideProduct[]): IRidesWithProducts => {
        console.log('Filtering to valid rides with products');
        products.forEach(p => p.is_valid = !!p.product_id);
        products = products.filter(p => p.is_valid);
        let productUsedMap: { [key: string] : boolean } = {};
        for (let p of products) {
            productUsedMap[p.product_id] = false;
        }
        const validRides = rides.filter(r => {
            productUsedMap[r.product_id] = r.product_id in productUsedMap;
            return productUsedMap[r.product_id];
        });
        const validProducts = products.filter(p => productUsedMap[p.product_id]);
        console.log('rides', rides.length, 'validRides', validRides.length, 'products', products.length, 'validProducts', validProducts.length);
        return { rides: validRides, products: validProducts };
    }

    getRideHistory = async (req: Request, res: Response): Promise<void> => {
        const userId = req.query.userId;
        const token = req.query.accessToken;
        const localCachedHistory = this.getCachedRideHistory(token);

        if (localCachedHistory) {
            res.send(localCachedHistory);
            return;
        }

        const cachedRides: IRide[] = await Ride.find({ user_id: userId }).exec();
        const cachedRideCount = cachedRides.length;
        if (!cachedRideCount) {
            return await this.sendAllRideHistoryAndProducts(res, token, userId);
        }
        const testBatchSize = this.API_MAX_RIDE_LIMIT;
        const rideHistory: IRideHistory = await this.retrieveRideHistoryAsync(token, testBatchSize, 0, userId, res);
        const totalRideCount = rideHistory.count;
        // If all results are cached, serve them
        if (cachedRideCount === totalRideCount) {
            console.log('All rides cached.');
            const validRidesWithProducts: IRidesWithProducts = await this.getProductsForRides(token, cachedRides);
            res.send(validRidesWithProducts);
            this.setCachedRideHistory(userId, validRidesWithProducts);
            await this.storeRides(validRidesWithProducts.rides);
            await this.storeProducts(validRidesWithProducts.products);
        } else if (cachedRideCount < totalRideCount) {
            // If we don't have all rides, retrieve them and merge them in
            console.log('New rides exist, retrieving them.');
            const retrievedRides: IRide[] = await this.retrieveRideHistory(token, totalRideCount - cachedRideCount, [], userId, res);
            const allRides: IRide[] = retrievedRides.concat(cachedRides);
            const validRidesWithProducts: IRidesWithProducts = await this.getProductsForRides(token, allRides);
            res.send(validRidesWithProducts);
            this.setCachedRideHistory(userId, validRidesWithProducts);
            await this.storeRides(retrievedRides); // cache the uncached rides
            await this.storeProducts(validRidesWithProducts.products);
        } else {
            res.status(500).send({
                code: ErrorType.ERR_CACHE_FAILURE,
                message: 'Ride cache is in an invalid state, refresh by invalidating the cache.'
            });
            Ride.deleteMany({ user_id: userId }).exec();
        }
    }
    
    getUserProfile = async (req: Request, res: Response): Promise<void> => {
        console.log('Retrieving user profile');
        const token = req.query.accessToken;
        return http({
            method: 'GET',
            uri: 'https://api.uber.com/v1.2/me',
            json: true, // Automatically parses the JSON string in the response
            headers: UberController.uberHeaders(token)
        }).then(function (profile) {
            res.send(profile);
        }).catch(function (err) {
            res.send({
                code: ErrorType.UBER_AUTH,
                message: 'Failed to retrieve rider profile ' + err.message
            });
        });
    }

    private getCachedRideHistory(userId: string): IRidesWithProducts {
        console.log('Retrieving from in-memory ride history cache.');
        return this.historyCache.get(userId);
    }
    
    private setCachedRideHistory(userId: string, v: IRidesWithProducts): void {
        // Convert from Mongoose docs to POJOs
        v.rides = v.rides.map(v => v.toJSON() as IRide);
        v.products = v.products.map(v => v.toJSON() as IRideProduct);
        this.historyCache.set(userId, v);
    }
}
