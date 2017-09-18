import { AccountService } from './account.service';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { IAddFriendArguments, IAddFriendsArguments, IFriend, WhimAPI } from '../models';

@Injectable()
export class FriendService {

  constructor(private http: HttpService, private accountService: AccountService) {}

  getAllFriends(): Promise<IFriend[]> {
    return Promise.resolve([]);
  }

  addFriends(newFriends: IAddFriendArguments[]): Promise<IFriend[]> {
    return this.accountService.currentUser$.then(currentUser => {
      const args: IAddFriendsArguments = { userId: currentUser._id, friends: newFriends };
      return this.http.post<IAddFriendsArguments, IFriend[]>(WhimAPI.AddFriends, args);
    });
  }

  updateFriends(friends: IFriend[]): Promise<void> {
    return this.accountService.currentUser$.then(currentUser => {
      return this.http.putOrThrow<IFriend[]>(WhimAPI.UpdateFriends, friends);
    });
  }

}
