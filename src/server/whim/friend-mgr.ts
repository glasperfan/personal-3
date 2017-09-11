import { Validator } from './validator';
import { IAddFriendArguments, IAddFriendsArguments, IFriend, IUser, WhimError } from './models';
import { DatabaseManager } from './database-mgr';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';
import * as moment from 'moment';

export class FriendManager {

  private readonly collectionTokenPrefix = 'friends';
  constructor(private dbMgr: DatabaseManager) { };

  getAllFriends(userId: string): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId).find({ userId: userId }).toArray();
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
    let newFriends: IFriend[];
    try {
      newFriends = args.friends.map(friendArg => this.createFriend(args.userId, friendArg));
    } catch (err) {
      return Promise.reject(err);
    }
    return this.getUserFriendCollection(args.userId).insertMany(newFriends).then(write => {
      if (!!write.result.ok) {
        return newFriends;
      }
      throw new WhimError(`FriendManager: could not create new friends.`);
    });
  }

  getUserFriendCollection(userId: string): MongoDB.Collection<IFriend> {
    return this.getUserCollection<IFriend>(userId);
  }

  private createFriend(userId: string, friendArg: IAddFriendArguments): IFriend {
    this.validateArguments(friendArg);
    return <IFriend>{
      _id: v4(),
      first: friendArg.first,
      last: friendArg.last,
      birthday: friendArg.birthday,
      email: friendArg.email,
      phone: friendArg.phone,
      location: friendArg.location,
      tags: friendArg.tags || [],
      methods: friendArg.methods || [],
      organization: friendArg.organization,
      skills: friendArg.skills || [],
      notes: friendArg.notes,
      userId: userId,
      wasRemoved: false,
      whenAdded: new Date(),
      whenLastModified: new Date()
    };
  }

  private validateArguments(args: IAddFriendArguments): void {
    if (!args.first) {
      throw new WhimError('Friends must have a first name.');
    }
    if (!args.last) {
      throw new WhimError('Friends must have a last name.');
    }
    if (args.email && !Validator.isEmail(args.email)) {
      throw new WhimError(`Cannot parse ${args.email} as a recognizable email.`);
    }
    if (args.phone && !Validator.isPhoneNumber(args.phone)) {
      throw new WhimError(`Cannot parse ${args.phone} as a recognizable phone number.`);
    }
    if (args.birthday && !Validator.isDate(args.birthday.toString())) {
      throw new WhimError(`Cannot parse ${args.birthday} as a recognizable birthday.`);
    }
  }

  private genUserCollectionToken(userId: string): string {
    return `${this.collectionTokenPrefix}/${userId}`;
  }

  private getUserCollection<T>(userId: string): MongoDB.Collection<T> {
    const token = this.genUserCollectionToken(userId);
    return this.dbMgr.getOrCreateCollection(token) as MongoDB.Collection<T>;
  }
}
