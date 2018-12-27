import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UberAuthService } from "./uber-auth.service";
import { IGetAllRidesResponse, IGetAllRidesRequest, IHistoricalRideWithProduct } from "../models/RideHistory";
import { map } from "rxjs/operators";
import { keyBy } from "lodash-es";
import { IRideProduct } from "../models/RideProduct";

const API = {
    history: 'http://localhost:6060/uber/history',
    allHistory: 'http://localhost:6060/uber/history/all'
};


@Injectable()
export class UberApiService {

    constructor(private authService: UberAuthService, private http: HttpClient) { }

    /**
     * Returns a limited amount of data about a user’s lifetime activity with Uber
     * @param offset Offset the list of returned results by this amount. Default is zero.
     * @param limit Number of items to retrieve. Default is 5, maximum is 50.
     */
    // getRideHistory(offset?: number, limit?: number): Observable<IRideHistoryResponse> {
    //     const request: IRideHistoryRequest = {
    //         offset: offset ? offset.toString() : '0',
    //         limit: limit ? limit.toString(): '6',
    //         accessToken: this.authService.currentUserToken
    //     }
    //     return this.http.get<IRideHistoryResponse>(API.history, { params: request })
    //         .pipe(
    //             tap(body => console.log(body))
    //         );
    // }

    getAllRides(): Observable<IHistoricalRideWithProduct[]> {
        const request: IGetAllRidesRequest = {
            userId: this.authService.currentUserId,
            accessToken: this.authService.currentUserToken
        };
        return this.http.get<IGetAllRidesResponse>(API.allHistory, { params: request }).pipe(map(response => {
            const productMap = keyBy(response.products, (rp: IRideProduct) => rp.product_id);
            return response.rides.map((ride: IHistoricalRideWithProduct) => {
                ride.product = productMap[ride.product_id];
                return ride;
            });
        }));
    }
}