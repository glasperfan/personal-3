import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UberAuthService } from "./uber-auth.service";
import { IGetAllRidesResponse, IGetAllRidesRequest, IHistoricalRideWithProduct } from "../models/RideHistory";
import { map } from "rxjs/operators";
import { keyBy } from "lodash-es";
import { IRideProduct } from "../models/RideProduct";
import { ServerAPI } from "../models/ServerApi";

@Injectable()
export class UberApiService {

    constructor(private authService: UberAuthService, private http: HttpClient, private server: ServerAPI) { }

    getRideHistory(): Observable<IHistoricalRideWithProduct[]> {
        const request: IGetAllRidesRequest = {
            userId: this.authService.currentUserId,
            accessToken: this.authService.currentUserToken
        };
        return this.http.get<IGetAllRidesResponse>(this.server.GetHistory, { params: request }).pipe(map(response => {
            const productMap = keyBy(response.products, (rp: IRideProduct) => rp.product_id);
            return response.rides.map((ride: IHistoricalRideWithProduct) => {
                ride.product = productMap[ride.product_id];
                return ride;
            });
        }));
    }
}