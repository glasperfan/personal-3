import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from "rxjs";
import { catchError, map, tap, flatMap } from "rxjs/operators";

interface ITokenResponse {
    accessToken: string;
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

    private readonly clientId: string = 'QKa6ZyD-Bqtc_oPjXEXuHymD9Gn-k0o4';
    private readonly cookieUserTokenKey: string = 'uber-footprint-access-token';
    private readonly cookieUserIdKey: string = 'uber-footprint-user-id';
    public uberAuthorizationUrl = `https://login.uber.com/oauth/v2/authorize?client_id=${this.clientId}&response_type=code&scope=history+profile`;
    public currentUserAuthorized: boolean;

    constructor(private http: HttpClient, private cookie: CookieService) {
        // this.cookie.delete(this.cookieUserTokenKey);
        // this.cookie.delete(this.cookieUserIdKey);
    }

    authorize(authorizationCode: string): Observable<boolean> {
        return this.exchangeAuthCodeForToken(authorizationCode)
            .pipe(
                flatMap(_ => this.getRiderProfile())
            );
    }

    getRiderProfile(): Observable<boolean> {
        return this.http.get<IRiderProfile>(`http://localhost:6060/uber/me`, { params: { accessToken: this.currentUserToken }})
            .pipe(
                tap(body => this.storeCurrentUserId(body.uuid)),
                map(body => true)
            );
    }

    private exchangeAuthCodeForToken(authorizationCode: string): Observable<boolean> {
        if (this.hasAccessToken) {
            return of(true);
        }
        return this.http.post<ITokenResponse>(`http://localhost:6060/uber/token`, { authorizationCode })
            .pipe(
                tap(body => this.storeCurrentUserAccessToken(body.accessToken)),
                map(body => true),
                catchError(err => of(false))
            );
    }

    checkIfUserIsAuthorized() {
        if (!this.isCurrentUserAuthorized) {
            new Location().assign(this.uberAuthorizationUrl);
        }
    }
    
    get isCurrentUserAuthorized(): boolean {
        return this.hasAccessToken && this.cookie.check(this.cookieUserIdKey);
    }

    private get hasAccessToken(): boolean {
        return this.cookie.check(this.cookieUserTokenKey);
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
}