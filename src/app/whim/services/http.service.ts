import { IError, WhimError } from '../models';
import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import * as Url from 'url';
import { API_URL } from 'app/whim/whim.module';
import { BehaviorSubject, Observable } from 'rxjs/Rx';

// tslint:disable-next-line:interface-over-type-literal
type QueryParams = { [key: string]: string };

@Injectable()
export class HttpService {
  public connRefused$: Observable<boolean>;
  private serverEndpoint: string;
  private _connRefused$: BehaviorSubject<boolean>;

  constructor(injector: Injector, private http: HttpClient) {
    this.serverEndpoint = injector.get(API_URL);
    this._connRefused$ = new BehaviorSubject<boolean>(false);
    this.connRefused$ = this._connRefused$.asObservable();
   }

  get<T>(url: string, queryParams?: QueryParams): Promise<T> {
    return this.http.get<T>(
      Url.resolve(this.serverEndpoint, url),
      { params: this.genParams(queryParams) }
    ).do((response: any) => {
      if (response.error) {
        throw response.error as IError;
      }
      }).toPromise<T>()
      .catch(err => this.proccessHttpError(err));
  }

  post<T, U>(url: string, payload: T): Promise<U> {
    return this.http.post<U>(
      Url.resolve(this.serverEndpoint, url),
      payload
    ).do((response: any) => this.checkForServerError(response))
      .toPromise<U>()
      .catch(err => this.proccessHttpError(err));
  }

  postOrThrow<T>(url: string, payload: T): Promise<void> {
    return this.http.post<void>(
      Url.resolve(this.serverEndpoint, url),
      payload
    ).do((response: any) => this.checkForServerError(response))
      .toPromise<void>()
      .catch(err => this.proccessHttpError(err));
  }

  put<T, U>(url: string, payload: T): Promise<U> {
    return this.http.put<U>(
      Url.resolve(this.serverEndpoint, url),
      payload
    ).do((response: any) => this.checkForServerError(response))
      .toPromise<U>()
      .catch(err => this.proccessHttpError(err));
  }

  putOrThrow<T>(url: string, payload: T): Promise<void> {
    return this.http.put<void>(
      Url.resolve(this.serverEndpoint, url),
      payload
    ).do((response: any) => this.checkForServerError(response))
      .toPromise<void>()
      .catch(err => this.proccessHttpError(err));
  }

  delete(url: string, queryParams?: QueryParams): Promise<void> {
    return this.http.delete<void>(
      Url.resolve(this.serverEndpoint, url),
      { params: this.genParams(queryParams) }
    )
    .do((response: any) => this.checkForServerError(response))
      .toPromise<void>()
      .catch(err => this.proccessHttpError(err));
  }

  private genParams(queryParams: QueryParams): HttpParams {
    if (!queryParams) {
      return undefined;
    }
    let params = new HttpParams();
    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        params = params.append(key, queryParams[key]);
      }
    }
    return params;
  }

  private checkForServerError(response: any): void {
    if (response.error) {
      throw response.error as IError;
    }
  }

  private proccessHttpError(err: HttpErrorResponse): any {
    // Connection refused
    if (err.status === 0) {
      this._connRefused$.next(true);
    }
    throw new WhimError(err.message, err.status);
  }

}
