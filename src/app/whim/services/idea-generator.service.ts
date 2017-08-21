import { Injectable } from '@angular/core';
import { IFriend, IGetIdeasForDateParams, IIdeaSelection, WhimAPI } from '../models';
import { FriendService } from './friend.service';
import { HistoryService } from './history.service';
import { HttpService } from './http.service';
import { MethodSettingsService } from './method-settings.service';

@Injectable()
export class IdeaGeneratorService {
  private friends: IFriend[];

  constructor(private http: HttpService) { }

  getIdeasForToday(userId: string): Promise<IIdeaSelection[]> {
    return this.getIdeasForDate(userId, new Date());
  }

  getIdeasForDate(userId: string, date: Date): Promise<IIdeaSelection[]> {
    const params: IGetIdeasForDateParams = { userId: userId, timestamp: date.getTime() };
    return this.http.get<IIdeaSelection[]>(WhimAPI.GetIdeasForDate, <any>params);
  }
}
