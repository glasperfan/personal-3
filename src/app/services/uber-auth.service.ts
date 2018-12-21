import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

interface ITokenResponse {
    accessToken: string;
}

@Injectable()
export class UberAuthService {

    private readonly clientId: string = 'QKa6ZyD-Bqtc_oPjXEXuHymD9Gn-k0o4';
    private readonly cookieUserKey: string = 'uber-footprint-access-token';

    public uberAuthorizationUrl = `https://login.uber.com/oauth/v2/authorize?client_id=${this.clientId}&response_type=code&scope=history`;
    public currentUserAuthorized: boolean;

    constructor(private http: HttpClient, private cookie: CookieService) { }

    exchangeAuthCodeForToken(authorizationCode: string): Observable<boolean> {
        if (this.isCurrentUserAuthorized) {
            console.log('retrieving cached token');
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
        return this.cookie.check(this.cookieUserKey);
    }

    get currentUserToken(): string {
        return this.cookie.get(this.cookieUserKey);
    }

    private storeCurrentUserAccessToken(accessToken: string): void {
        this.cookie.set(this.cookieUserKey, accessToken);
    }
}