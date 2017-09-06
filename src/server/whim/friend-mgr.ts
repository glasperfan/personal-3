import { IAddFriendArguments, IAddFriendsArguments, IFriend, IUser, WhimError } from './models';
import { DatabaseManager } from './database-mgr';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';

export class FriendManager {

  private readonly collectionTokenPrefix = 'friends';
  constructor(private dbMgr: DatabaseManager) { };

  getAllFriends(userId: string): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId).then(collection =>
      collection.find({ userId: userId }).toArray()
    );
  }

  getAvailableFriends(userId: string): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId).then(collection =>
      collection.find({ userId: userId, wasRemoved: false }).toArray()
    );
  }

  getRemovedFriends(userId: string): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId).then(collection =>
      collection.find({ userId: userId, wasRemoved: true }).toArray()
    );
  }

  createFriends(args: IAddFriendsArguments): Promise<IFriend[]> {
    const newFriends: IFriend[] = args.friends.map(friendArg => this.createFriend(args.userId, friendArg));
    return this.getUserFriendCollection(args.userId).then(collection => {
      return collection.insertMany(newFriends).then(write => {
        if (!!write.result.ok) {
          return newFriends;
        }
        throw new WhimError(`FriendManager: could not create new friends.`);
      });
    });
  }

  getUserFriendCollection(userId: string): Promise<MongoDB.Collection<IFriend>> {
    return this.getUserCollection<IFriend>(userId);
  }

  private createFriend(userId: string, friendArg: IAddFriendArguments): IFriend {
    return <IFriend>{
      _id: v4(),
      first: friendArg.first,
      last: friendArg.last,
      birthday: friendArg.birthday,
      email: friendArg.email,
      phone: friendArg.phone,
      location: friendArg.location,
      tags: friendArg.tags,
      methods: friendArg.methods,
      organization: friendArg.organization,
      skills: friendArg.skills,
      notes: friendArg.notes,
      userId: userId,
      wasRemoved: false,
      whenAdded: new Date(),
      whenLastModified: new Date()
    };
  }

  private genUserCollectionToken(userId: string): string {
    return `${this.collectionTokenPrefix}/${userId}`;
  }

  private getUserCollection<T>(userId: string): Promise<MongoDB.Collection<T>> {
    const token = this.genUserCollectionToken(userId);
    const collection = this.dbMgr.getOrCreateCollection(token) as MongoDB.Collection<T>;
    return collection.createIndex({'$**': 'text'}).then(_ => collection);
  }
}
