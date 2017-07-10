import { Injectable } from '@angular/core';
import { IFriend, IIdeaSelection } from '../models';
import { FriendService } from './friend.service';
import { HistoryService } from './history.service';
import { MethodSettingsService } from './method-settings.service';

@Injectable()
export class IdeaGeneratorService {
  private friends: IFriend[];

  constructor() { }

  getIdeasForToday(): Promise<IIdeaSelection[]> {
    return this.getIdeasForDate(new Date());
  }

  // method settings service =>
  // people settings service =>
  // history service =>
  // friend retrieval service => ideas generator VM => ideas view
  getIdeasForDate(date: Date): Promise<IIdeaSelection[]> {
    return Promise.resolve([]);
  }
}
