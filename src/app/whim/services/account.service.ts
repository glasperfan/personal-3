import {
    IGetUserParams,
    IGetUserResponse,
    ILoginArguments,
    ILoginResponse,
    ISignupArguments,
    ISignupResponse,
    IUser,
    WhimAPI,
} from '../models';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import * as Cookies from 'js-cookie';

export interface IEmailCookie {
  email: string;
}

export interface IAuthCookie {
  userId: string;
}

@Injectable()
export class AccountService {
  private readonly WhimEmailCookieKey = 'whim-app-email';
  private readonly WhimAuthCookieKey = 'whim-app-id';
  private readonly emailCookieExpiration = 7;
  private readonly authCookieExpiration = 1;

  constructor(private http: HttpService) {
    // this.removeEmailCookie();
    // this.removeAuthCookie();
  }

  public login(email: string, passcode: string): Promise<IUser> {
    return this.http.post<ILoginArguments, ILoginResponse>(WhimAPI.Login, { email: email, passcode: passcode })
      .then((response: ILoginResponse) => Promise.resolve(response as IUser));
  }

  public logout(): Promise<void> {
    return this.http.postOrThrow<void>(WhimAPI.Logout, undefined);
  }

  public signup(args: ISignupArguments): Promise<IUser> {
    return this.http.post<ISignupArguments, ISignupResponse>(WhimAPI.Signup, args)
      .then((response: ISignupResponse) => Promise.resolve(response as IUser));
  }

  public getUser(userId: string): Promise<IUser> {
    return this.http.get<IGetUserResponse>(WhimAPI.GetUser, { _id: userId })
      .then((response: IGetUserResponse) => Promise.resolve(response as IUser));
  }

  public getUserByEmail(email: string): Promise<IUser> {
    return this.http.get<IUser>(WhimAPI.GetUser, { email: email });
  }

  public get userHasSession(): boolean {
    return !!this.getEmailCookie();
  }

  public get userIsAuthenticated(): Promise<boolean> {
    const authCookie: IAuthCookie = this.getAuthCookie();
    if (!authCookie) {
      return Promise.resolve(false);
    }
    return this.getUser(authCookie.userId).then((user: IUser) => {
      return !!user && user._id === authCookie.userId;
    }).catch(_ => Promise.resolve(false));
  }

  public getEmailCookie(): IEmailCookie {
    const cookie = Cookies.get(this.WhimEmailCookieKey);
    return cookie ? JSON.parse(cookie) as IEmailCookie : undefined;
  }

  public getAuthCookie(): IAuthCookie {
    const cookie = Cookies.get(this.WhimAuthCookieKey);
    return cookie ? JSON.parse(cookie) as IAuthCookie : undefined;
  }

  public storeEmailCookie(email: string): void {
    Cookies.set(this.WhimEmailCookieKey, JSON.stringify({ email: email }), { expires: this.emailCookieExpiration });
  }

  public storeAuthCookie(userId: string): void {
    Cookies.set(this.WhimAuthCookieKey, JSON.stringify({ userId: userId }), { expires: this.authCookieExpiration });
  }

  public removeEmailCookie(): void {
    Cookies.remove(this.WhimEmailCookieKey);
  }

  public removeAuthCookie(): void {
    Cookies.remove(this.WhimAuthCookieKey);
  }
}
