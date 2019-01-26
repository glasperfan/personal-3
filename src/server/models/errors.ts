import { Response } from "express";


export enum ErrorType {
    UBER_AUTH = 403,
    UBER_API = 500,
    ERR_CACHE_FAILURE = 500
}

export class ServerError {
    constructor (public code: ErrorType, public message: string) { }
    send = (res: Response): Response => res.status(this.code).json({ message: this.message });
}


export const UberTokenAuthenticationException = new ServerError(ErrorType.UBER_AUTH, 'Failed to obtain access token');
export const UberLogoutFailureException = new ServerError(ErrorType.UBER_AUTH, 'Could not logout user.');
export const UberRideHistoryFailureHistoryException = new ServerError(ErrorType.UBER_API, 'Failed to retrieve ride history.');
