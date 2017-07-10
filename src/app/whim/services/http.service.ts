import { Injectable } from '@angular/core';

@Injectable()
export class HttpService {

  get<T>(url: string): Promise<T> {
    return undefined;
  }

  post<T>(url: string, payload: T): Promise<void> {
    return undefined;
  }

  postWithSuccess<T>(): Promise<boolean> {
    return undefined;
  }

  delete<T>(): Promise<void> {
    return undefined;
  }
}
