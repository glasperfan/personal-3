import { IError } from '../models';
import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import * as Url from 'url';
import { API_URL } from 'app/whim/whim.module';

// tslint:disable-next-line:interface-over-type-literal
type QueryParams = { [key: string]: string };

@Injectable()
export class HttpService {
  private serverEndpoint: string;

  constructor(injector: Injector, private http: HttpClient) {
    this.serverEndpoint = injector.get(API_URL);
   }

  get<T>(url: string, queryParams?: QueryParams): Promise<T> {
    return this.http.get<T>(
      Url.resolve(this.serverEndpoint, url),
      { params: this.genParams(queryParams) }
    ).do((response: any) => {
      if (response.error) {
        throw response.error as IError;
      }
    }).toPromise<T>();
  }

  post<T, U>(url: string, payload: T): Promise<U> {
    return this.http.post<U>(
      Url.resolve(this.serverEndpoint, url),
      payload
    ).do((response: any) => {
      if (response.error) {
        throw response.error as IError;
      }
    }).toPromise<U>();
  }

  postOrThrow<T>(url: string, payload: T): Promise<void> {
    return this.http.post<void>(
      Url.resolve(this.serverEndpoint, url),
      payload
    ).do((response: any) => {
      if (response.error) {
        throw response.error as IError;
      }
    }).toPromise<void>();
  }

  put<T, U>(url: string, payload: T): Promise<U> {
    return this.http.put<U>(
      Url.resolve(this.serverEndpoint, url),
      payload
    ).do((response: any) => {
      if (response.error) {
        throw response.error as IError;
      }
    }).toPromise<U>();
  }

  putOrThrow<T>(url: string, payload: T): Promise<void> {
    return this.http.put<void>(
      Url.resolve(this.serverEndpoint, url),
      payload
    ).do((response: any) => {
      if (response.error) {
        throw response.error as IError;
      }
    }).toPromise<void>();
  }

  delete(url: string, queryParams?: QueryParams): Promise<void> {
    return this.http.delete<void>(
      Url.resolve(this.serverEndpoint, url),
      { params: this.genParams(queryParams) }
    ).do((response: any) => {
      if (response.error) {
        throw response.error as IError;
      }
    }).toPromise<void>();
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
}
