
export class ServerAPI {
    constructor(private baseUrl: string) { }
    SendEmail = `${this.baseUrl}/email`;
    GetHistory = `${this.baseUrl}/uber/history`;
    GetPlacement = `${this.baseUrl}/uber/placement`;
    GetUserToken = `${this.baseUrl}/uber/token`;
    GetUserProfile = `${this.baseUrl}/uber/me`;
    Logout = `${this.baseUrl}/uber/logout`;
}