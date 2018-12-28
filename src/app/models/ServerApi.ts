
export class ServerAPI {
    constructor(private baseUrl: string) { }
    SendEmail: string = `${this.baseUrl}/email`;
    GetAllHistory: string = `${this.baseUrl}/uber/history/all`;
    GetUserToken: string = `${this.baseUrl}/uber/token`;
    GetUserProfile: string = `${this.baseUrl}/uber/me`;
}