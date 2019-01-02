
export class ServerAPI {
    constructor(private baseUrl: string) { }
    SendEmail: string = `${this.baseUrl}/email`;
    GetHistory: string = `${this.baseUrl}/uber/history`;
    GetUserToken: string = `${this.baseUrl}/uber/token`;
    GetUserProfile: string = `${this.baseUrl}/uber/me`;
}