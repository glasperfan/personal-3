import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import { UberAuthService } from "./uber-auth.service";
import { Observable } from "rxjs";

export type HttpStringParams = {
    [param: string]: string | string[];
};

export interface IAccessToken extends HttpStringParams {
    accessToken: string;
}


export interface IRideHistoryRequest extends IAccessToken {
    offset?: string;
}

export interface IHistoricalRideCity {
    display_name: string;
    latitude: string;
    longitude: string;
}

export interface IHistoricalRide {
    request_id: string;
    request_time: number;
    start_time: number;
    start_city: IHistoricalRideCity;
    product_id: string;
    status: string;
    distance: number;
    end_time: number;
}

export interface IRideHistoryResponse {
    offset: number;
    limit: number;
    count: number;
    history: IHistoricalRide[];
}

const API = {
    history: 'http://localhost:6060/uber/history'
};


@Injectable()
export class UberApiService {

    constructor(private authService: UberAuthService, private http: HttpClient) { }

    /**
     * Returns a limited amount of data about a user’s lifetime activity with Uber
     * @param offset Offset the list of returned results by this amount. Default is zero.
     * @param limit Number of items to retrieve. Default is 5, maximum is 50.
     */
    getRideHistory(offset?: number, limit?: number): Observable<IRideHistoryResponse> {
        const request: IRideHistoryRequest = {
            offset: offset ? offset.toString() : '0',
            accessToken: this.authService.currentUserToken
        }
        return this.http.get<IRideHistoryResponse>(API.history, { params: request })
            .pipe(
                tap(body => console.log(body))
            );
    }
}