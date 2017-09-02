import { IAddFriendArguments, IAddFriendsArguments, IFriend, IUser, WhimError } from './models';
import { DatabaseManager } from './database-mgr';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';

export class FriendManager {

  private readonly collectionTokenPrefix = 'friends';

  constructor(private dbMgr: DatabaseManager) { };

  getAllFriends(userId: string): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId)
      .find({ userId: userId }).toArray();
  }

  getAvailableFriends(userId: string): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId)
      .find({ userId: userId, wasRemoved: false }).toArray();
  }

  getRemovedFriends(userId: string): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId)
      .find({ userId: userId, wasRemoved: true }).toArray();
  }

  createFriends(args: IAddFriendsArguments): Promise<IFriend[]> {
    const newFriends: IFriend[] = args.friends.map(friendArg => this.createFriend(args.userId, friendArg));
    return this.getUserFriendCollection(args.userId)
      .insertMany(newFriends).then(write => {
        if (!!write.result.ok) {
          return newFriends;
        }
        throw new WhimError(`FriendManager: could not create new friends.`);
      });
  }

  private createFriend(userId: string, friendArg: IAddFriendArguments): IFriend {
    return <IFriend>{
      _id: v4(),
      first: friendArg.first,
      last: friendArg.last,
      notes: friendArg.notes,
      userId: userId,
      wasRemoved: false
    };
  }

  private genUserCollectionToken(userId: string): string {
    return `${this.collectionTokenPrefix}/${userId}`;
  }

  private getUserCollection<T>(userId: string): MongoDB.Collection<T> {
    const token = this.genUserCollectionToken(userId);
    return this.dbMgr.getOrCreateCollection(token) as MongoDB.Collection<T>;
  }

  private getUserFriendCollection(userId: string): MongoDB.Collection<IFriend> {
    return this.getUserCollection<IFriend>(userId);
  }
}
