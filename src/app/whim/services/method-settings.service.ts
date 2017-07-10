import { Injectable } from '@angular/core';
import { IMethod } from '../models';
import { HttpService } from './http.service';

@Injectable()
export class MethodSettingsService {

  private defaultMethods: IMethod[];

  constructor(httpService: HttpService) {
    this.defaultMethods = [];
  }

  get DefaultIdeaMethods(): IMethod[] {
    return this.defaultMethods;
  }

  getMethodsForUser(): Promise<IMethod[]> {
    return Promise.resolve(this.DefaultIdeaMethods);
  }

}
