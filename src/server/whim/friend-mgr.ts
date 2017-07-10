import { IFriend, IUser } from '../../app/whim/models';
import { DatabaseManager } from './database-mgr';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';

export class FriendManager {

  private dbMgr: DatabaseManager;
  private readonly collectionTokenPrefix = 'friends';

  constructor(dbMgr: DatabaseManager) {
    this.dbMgr = dbMgr;
  }

  getAllFriends(user: IUser): Promise<IFriend[]> {
    return this.saveInitialFriends(user).then(res => {
      const userCollection = this.getUserFriendCollection(user);
      return userCollection.find({ userId: user.id }).toArray();
    });
  }

  getAvailableFriends(user: IUser): Promise<IFriend[]> {
    return this.getAllFriends(user);
  }

  getRemovedFriends(user: IUser): Promise<IFriend[]> {
    return Promise.resolve([]);
  }

  saveInitialFriends(user: IUser): Promise<MongoDB.InsertWriteOpResult> {
    const userCollection = this.getUserFriendCollection(user);
    return userCollection.insertMany(<IFriend[]>[
      {
        id: v4(),
        first: '321',
        last: 'Zabriskie',
        userId: user.id,
        wasRemoved: false
      },
      {
        id: v4(),
        first: '231',
        last: 'Zabriskie',
        userId: user.id,
        wasRemoved: false
      },
      {
        id: v4(),
        first: '12',
        last: 'Zabriskie',
        userId: user.id,
        wasRemoved: false
      },
      {
        id: v4(),
        first: '23',
        last: 'Zabriskie',
        userId: user.id,
        wasRemoved: false
      }
    ]);
  }

  private genUserCollectionToken(user: IUser) {
    return `${this.collectionTokenPrefix}/${user.id}`;
  }

  private getUserCollection<T>(user: IUser): MongoDB.Collection<T> {
    const token = this.genUserCollectionToken(user);
    return this.dbMgr.getOrCreateCollection(token) as MongoDB.Collection<T>;
  }

  private getUserFriendCollection(user: IUser): MongoDB.Collection<IFriend> {
    return this.getUserCollection<IFriend>(user);
  }
}
