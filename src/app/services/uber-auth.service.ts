import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";


@Injectable()
export class UberAuthService {

    private readonly clientId: string = 'QKa6ZyD-Bqtc_oPjXEXuHymD9Gn-k0o4';
    public uberAuthorizationUrl = `https://login.uber.com/oauth/v2/authorize?client_id=${this.clientId}&response_type=code&scope=history`;

    constructor(private http: HttpClient) { }

    exchangeAuthCodeForToken(authorizationCode: string) {
        return this.http.post(`http://localhost:6060/uber/token`, { authorizationCode });
    }
}