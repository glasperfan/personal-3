import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UberAuthService } from "./uber-auth.service";
import { 
    IGetAllRidesResponse,
    IGetAllRidesRequest,
    IHistoricalRideWithProduct,
    IPlacementResponse,
    IPlacementRequest,
    IRiderProfileRequest,
    IRiderProfileResponse
} from "../models/RideHistory";
import { map } from "rxjs/operators";
import { keyBy } from "lodash-es";
import { IRideProduct } from "../models/RideProduct";
import { ServerAPI } from "../models/ServerApi";
import { Cacheable } from 'ngx-cacheable';

@Injectable()
export class UberApiService {

    constructor(private authService: UberAuthService, private http: HttpClient, private server: ServerAPI) { }

    @Cacheable()
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

    @Cacheable()
    getPlacement(): Observable<IPlacementResponse> {
        const request: IPlacementRequest = {
            userId: this.authService.currentUserId
        };
        return this.http.get<IPlacementResponse>(this.server.GetPlacement, { params: request });
    }

    @Cacheable()
    getUserProfile(): Observable<IRiderProfileResponse> {
        const request: IRiderProfileRequest = {
            accessToken: this.authService.currentUserToken
        };
        return this.http.get<IRiderProfileResponse>(this.server.GetUserProfile, { params: request });
    }
}