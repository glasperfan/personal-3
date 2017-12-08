import { IGetFriendArguments } from '../../src/models/api';
import { IFriend, IAddFriendsArguments, IDeleteFriendsArguments } from '../../src/models';
import { IFriendManager } from '../../src/managers/contracts/IFriendManager';

export class FakeFriendManager implements IFriendManager {

  constructor(public allFriends: IFriend[] = []) { }

  public getAllFriends(userId: string): Promise<IFriend[]> {
    return Promise.resolve(this.allFriends);
  }

  public getFriend(args: IGetFriendArguments): Promise<IFriend> {
    return Promise.resolve(this.allFriends.find(f => f._id === args.friendId));
  }

  public createFriends(args: IAddFriendsArguments): Promise<IFriend[]> {
      throw new Error('Not implemented yet.');
  }

  public updateFriends(args: IFriend[]): Promise<IFriend[]> {
      throw new Error('Not implemented yet.');
  }

  public searchByText(userId: string, searchComponents: string[]): Promise<IFriend[]> {
      throw new Error('Not implemented yet.');
  }

  public deleteFriends(args: IDeleteFriendsArguments): Promise<void> {
      throw new Error('Not implemented yet.');
  }

  public createBirthdays(userId: string, newFriends: IFriend[]): Promise<void> {
    throw new Error('Not implemented yet.');
  }
}
