import { sum, groupBy, mapValues, keyBy } from 'lodash';
import { EPAStandardEmissionsService, EPAStandardEmissionsProps } from "./EPAEmissionsService";
import { EmissionsService } from "./EmissionsService";
import { IRide, Ride } from "../models/Rides";
import { IRideProduct, RideProduct } from "../models/RideProducts";

export class RideStatsService {

    private emissionsService: EmissionsService<EPAStandardEmissionsProps> = new EPAStandardEmissionsService();
    private placementCache: string[]; // userId

    constructor() {
        // every 10 minutes refresh the cache
        this.calculateAllPlacements().then(() => {
            setInterval(async () => { await this.calculateAllPlacements(); }, 1000 * 60 * 10); // expiration time: 10 minutes
        });
    }

    getRiderPlacement = (userId: string): number => {
        let position = this.placementCache.indexOf(userId);
        if (position < 0) {
            position = this.placementCache.length + 1;
        }
        return position + 1; // position 0 = 1st place
    }

    private calculateAllPlacements = async () => {
        console.log('Refreshing rider cache.');
        const allRides: IRide[] = await Ride.find().exec();
        const allProducts: IRideProduct[] = await RideProduct.find().exec();
        console.log('Current total ride cache size: ' + allRides.length);
        console.log('Current product cache size ' + allProducts.length);
        this.placementCache = this.calculatePlacementCache(allRides, allProducts);
        console.log('Placement cache rankings');
        console.log(this.placementCache);
    }

    private calculatePlacementCache(rides: IRide[], products: IRideProduct[]): string[] {
        const productMap: { [productId: string] : IRideProduct } = keyBy(products, (p: IRideProduct) => p.product_id);
        const byUserId: { [userId: string]: IRide[] } = groupBy(rides, r => r.user_id);
        const withRatio: { [userId: string]: number } = mapValues(byUserId, (userRides) => {
            const totalDistance = sum(userRides.map(r => r.distance));
            const totalEmissions = sum(userRides.map(r => {
                const rideProduct = productMap[r.product_id];
                const isSharedRide = (rideProduct && rideProduct.shared) || false;
                return this.emissionsService.calculateEmissions({ miles: r.distance, isSharedRide: isSharedRide });
            }));
            return totalEmissions ? totalDistance / totalEmissions : 0;
        });
        const userIds = Object.keys(withRatio);
        console.log(`Caching placements for ${userIds.length} total riders.`);
        console.log(userIds.map(u => [u, withRatio[u]]));
        return userIds.sort((u1, u2) => withRatio[u2] - withRatio[u1]);
    }
}