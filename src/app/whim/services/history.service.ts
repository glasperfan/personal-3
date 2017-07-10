import { Injectable } from '@angular/core';
import { IIdeaSelection } from '../models';

@Injectable()
export class HistoryService {

  getHistoryForDate(date: Date): Promise<IIdeaSelection[]> {
    return Promise.resolve([]);
  }

  setHistoryForDate(date: Date, history: IIdeaSelection[]): Promise<void> {
    return Promise.resolve(undefined);
  }

}
