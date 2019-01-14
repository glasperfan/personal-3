import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from "rxjs";
import { map, tap, flatMap } from "rxjs/operators";
import { ServerAPI } from "../models/ServerApi";
import { UberAPI } from "../models/UberApi";

interface ITokenResponse {
    accessToken: string;
}

export interface IError {
    code: string;
    message: string;
}

export interface IRiderProfile { 
    picture: string;
    first_name: string;
    last_name: string;
    rider_id: string;
    email: string;
    uuid: string;
}

@Injectable()
export class UberAuthService {

    private readonly cookieUserTokenKey: string = 'uber-footprint-access-token';
    private readonly cookieUserIdKey: string = 'uber-footprint-user-id';
    public privacyPolicyUrl = 'https://app.termly.io/document/privacy-policy/0b244b38-f8b7-4de0-a61d-da0faaf8fb40';
    public loginUrl = `/footprint`;
    public logoutUrl = 'https://riders.uber.com/logout';
    public currentUserAuthorized: boolean;

    constructor(
        private http: HttpClient,
        private cookie: CookieService,
        private server: ServerAPI,
        private uber: UberAPI) { }

    authorize(authorizationCode: string): Observable<boolean> {
        return this.exchangeAuthCodeForToken(authorizationCode)
            .pipe(
                tap(res => this.handleError(res)),
                flatMap(_ => this.getRiderProfile())
            );
    }

    getRiderProfile(): Observable<boolean> {
        return this.http.get<IRiderProfile>(this.server.GetUserProfile, { params: { accessToken: this.currentUserToken }})
            .pipe(
                tap(res => this.handleError(res)),
                tap(body => this.storeCurrentUserId(body.uuid)),
                map(_ => true)
            );
    }

    logout(): Observable<boolean> {
        return this.http.post<boolean>(this.server.Logout, { accessToken: this.currentUserToken })
            .pipe(
                tap(res => this.handleError(res)),
                tap(loggedOut => loggedOut ? this.deleteUserCookies() : () => {})
            );
    }

    private handleError(res: any | IError): any | IError {
        if (res instanceof Object && 'code' in res && 'message' in res) {
            throw res as IError;
        }
        return res;
    }

    deleteUserCookies(): void {
        this.cookie.delete(this.cookieUserTokenKey);
        this.cookie.delete(this.cookieUserIdKey);
    }

    private exchangeAuthCodeForToken(authorizationCode: string): Observable<boolean> {
        if (this.hasAccessToken) {
            return of(true);
        }
        return this.http.post<ITokenResponse>(this.server.GetUserToken, { authorizationCode: authorizationCode })
            .pipe(
                tap(res => this.handleError(res)),
                tap(body => this.storeCurrentUserAccessToken(body.accessToken)),
                map(_ => true)
            );
    }

    checkIfUserIsAuthorized() {
        if (!this.isCurrentUserAuthorized) {
            new Location().assign(this.uberAuthorizationUrl);
        }
    }
    
    get isCurrentUserAuthorized(): boolean {
        return this.hasAccessToken && this.hasUserId;
    }

    private get hasAccessToken(): boolean {
        return this.cookieExists(this.cookieUserTokenKey);
    }

    private get hasUserId(): boolean {
        return this.cookieExists(this.cookieUserIdKey);
    }

    private cookieExists(key: string): boolean {
        // returns as empty string if deleted
        if (!this.cookie.check(key)) {
            return false;
        }
        const token = this.cookie.get(key);
        if (!token.length || token === 'undefined') {
            this.cookie.set(key, undefined);
            return false;
        }
        return true;
    }

    get currentUserToken(): string {
        return this.cookie.get(this.cookieUserTokenKey);
    }

    get currentUserId(): string {
        return this.cookie.get(this.cookieUserIdKey);
    }

    private storeCurrentUserAccessToken(accessToken: string): void {
        this.cookie.set(this.cookieUserTokenKey, accessToken);
    }

    private storeCurrentUserId(userId: string): void {
        this.cookie.set(this.cookieUserIdKey, userId);
    }

    private uberAuthorizationUrl = 
        `https://login.uber.com/oauth/v2/authorize?client_id=${this.uber.ClientId}&response_type=code&scope=history+profile`;
}