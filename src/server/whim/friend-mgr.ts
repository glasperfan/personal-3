import { IAddFriendArguments, IAddFriendsArguments, IFriend, IUser } from './models';
import { DatabaseManager } from './database-mgr';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';

export class FriendManager {

  private dbMgr: DatabaseManager;
  private readonly collectionTokenPrefix = 'friends';

  constructor(dbMgr: DatabaseManager) {
    this.dbMgr = dbMgr;
  }

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
        throw new Error(`FriendManager: could not create new friends.`);
      });
  }

  saveInitialFriends(userId: string): Promise<MongoDB.InsertWriteOpResult> {
    return this.getUserFriendCollection(userId).insertMany(<IFriend[]>[
      {
        _id: v4(),
        first: '321',
        last: 'Zabriskie',
        userId: userId,
        wasRemoved: false
      },
      {
        _id: v4(),
        first: '231',
        last: 'Zabriskie',
        userId: userId,
        wasRemoved: false
      },
      {
        _id: v4(),
        first: '12',
        last: 'Zabriskie',
        userId: userId,
        wasRemoved: false
      },
      {
        _id: v4(),
        first: '23',
        last: 'Zabriskie',
        userId: userId,
        wasRemoved: false
      }
    ]);
  }

  private createFriend(userId: string, friendArg: IAddFriendArguments): IFriend {
    return <IFriend>{
      _id: v4(),
      first: friendArg.first,
      last: friendArg.last,
      userId: userId,
      wasRemoved: false
    };
  }

  private genUserCollectionToken(userId: string) {
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
