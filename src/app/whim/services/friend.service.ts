import { Injectable } from '@angular/core';
import { IFriend } from '../models';

@Injectable()
export class FriendService {

  getAllFriends(): Promise<IFriend[]> {
    return Promise.resolve([]);
  }
}
