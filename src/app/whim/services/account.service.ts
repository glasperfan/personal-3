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
import { BehaviorSubject } from 'rxjs/Rx';

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
  private _currentUser$: BehaviorSubject<IUser> = new BehaviorSubject<IUser>(undefined);

  constructor(private http: HttpService) {}

  public get currentUser$(): Promise<IUser> {
    return this._currentUser$.take(1).toPromise();
  }

  public get currentUserIsAuthenticated$(): Promise<boolean> {
    return this._currentUser$.map(user => !!user).take(1).toPromise();
  }

  public login(email: string, passcode: string): Promise<IUser> {
    return this.http.post<ILoginArguments, ILoginResponse>(WhimAPI.Login, { email: email, passcode: passcode })
      .then((response: ILoginResponse) => {
        const authenticatedUser: IUser = response as IUser;
        this.afterLogin(authenticatedUser);
        return Promise.resolve(authenticatedUser);
      });
  }

  public afterLogin(authenticatedUser: IUser): void {
    this._currentUser$.next(authenticatedUser);
    this.storeEmailCookie(authenticatedUser.email);
    this.storeAuthCookie(authenticatedUser._id);
  }

  public logout(): void {
    this.removeEmailCookie();
    this.removeAuthCookie();
  }

  public signup(args: ISignupArguments): Promise<IUser> {
    return this.http.post<ISignupArguments, ISignupResponse>(WhimAPI.Signup, args)
      .then((response: ISignupResponse) => {
        const authenticatedUser: IUser = response as IUser;
        this.afterLogin(authenticatedUser);
        return Promise.resolve(response as IUser);
      });
  }

  public getUser(userId: string): Promise<IUser> {
    return this.http.get<IGetUserResponse>(WhimAPI.GetUser, { _id: userId })
      .then((response: IGetUserResponse) => Promise.resolve(response as IUser));
  }

  public getLastLoggedInUser(): Promise<IUser> {
    const emailCookie = this.getEmailCookie();
    return this.getUserByEmail(emailCookie.email);
  }

  public getUserByEmail(email: string): Promise<IUser> {
    return this.http.get<IUser>(WhimAPI.GetUser, { email: email })
    .catch(_ => Promise.resolve(undefined));
  }

  public get userHasSession(): boolean {
    return !!this.getEmailCookie();
  }

  public get userIsAuthenticated(): Promise<boolean> {
    const authCookie: IAuthCookie = this.getAuthCookie();
    if (!authCookie) {
      return Promise.resolve(false);
    }
    const emailCookie: IEmailCookie = this.getEmailCookie();
    return this.getUserByEmail(emailCookie.email).then((user: IUser) => {
      const isAuthentic = !!user && user._id === authCookie.userId;
      if (isAuthentic) {
        this._currentUser$.next(user);
      }
      return isAuthentic;
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

  private removeEmailCookie(): void {
    Cookies.remove(this.WhimEmailCookieKey);
  }

  private removeAuthCookie(): void {
    Cookies.remove(this.WhimAuthCookieKey);
  }

  private storeEmailCookie(email: string): void {
    Cookies.set(
      this.WhimEmailCookieKey,
      JSON.stringify({ email: email }),
      { expires: this.emailCookieExpiration });
  }

  private storeAuthCookie(userId: string): void {
    Cookies.set(this.WhimAuthCookieKey, JSON.stringify({ userId: userId }), { expires: this.authCookieExpiration });
  }
}
