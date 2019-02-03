import { IRideProduct } from "./RideProduct";

export type HttpStringParams = {
    [param: string]: string | string[];
};

export interface IAccessToken extends HttpStringParams {
    accessToken: string;
}

export interface IGetAllRidesRequest extends IAccessToken {
    userId: string;
}

export interface IGetAllRidesResponse {
    rides: IHistoricalRide[];
    products: IRideProduct[];
}


export interface IRideHistoryRequest extends IAccessToken {
    limit?: string;
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

export interface IHistoricalRideWithProduct extends IHistoricalRide {
    product: IRideProduct;
}

export interface IRideHistoryResponse {
    offset: number;
    limit: number;
    count: number;
    history: IHistoricalRide[];
}

export interface IPlacementRequest extends HttpStringParams {
    userId: string;
}

export interface IPlacementResponse {
    placement: number;
}

export interface IRiderProfile {
    picture: string;
    first_name: string;
    last_name: string;
    uuid: string;
    rider_id: string;
    email: string;
    mobile_verified: boolean;
    promo_code: string;
}

export interface IRiderProfileRequest extends IAccessToken { }

export interface IRiderProfileResponse {
    profile: IRiderProfile;
}