import { IFriendManager } from './contracts/IFriendManager';
import { IDateParser } from '../parsers/dates/contracts/IDateParser';
import { DateParser, Validator } from '../parsers';
import {
    IAddFriendArguments,
    IAddFriendsArguments,
    IGetFriendArguments,
    IFriend,
    IParsedDate,
    IUser,
    Note,
    WhimError,
} from '../models';
import { DatabaseManager } from '../managers';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';
import * as moment from 'moment';

export class FriendManager implements IFriendManager {

  // Note: 'text' fields must all be adjacent
  public static readonly QueryIndexes: { [field: string]: string | number } = {
    'name.displayName': 'text',
    email: 'text',
    phone: 'text',
    'address.address1': 'text',
    'address.address2': 'text',
    'address.city': 'text',
    'address.state': 'text',
    'address.country': 'text',
    organization: 'text',
    'notes.text': 'text'
  };

  public static readonly TagIndex = 'tags';

  private readonly collectionTokenPrefix = 'friends';
  constructor(private dbMgr: DatabaseManager, private dateParser: IDateParser) { };


  getAllFriends(userId: string): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId).then(collection =>
      collection.find({ userId: userId }).toArray()
    );
  }

  public getFriend(args: IGetFriendArguments): Promise<IFriend> {
    return this.getUserFriendCollection(args.userId).then(collection =>
      collection.findOne({ _id: args.friendId })
    );
}

  createFriends(args: IAddFriendsArguments): Promise<IFriend[]> {
    let newFriends: IFriend[];
    try {
      newFriends = args.friends.map(friendArg => this.createFriend(args.userId, friendArg));
    } catch (err) {
      return Promise.reject(err);
    }

    const operation = this.getUserFriendCollection(args.userId).then(collection =>
      collection.insertMany(newFriends));

    return operation.then(write => {
      if (!!write.result.ok) {
        return newFriends;
      }
      throw new WhimError(`FriendManager: could not create new friends.`);
    });
  }

  updateFriends(args: IFriend[]): Promise<void> {
    const ops: Promise<void>[] = [];
    for (const el of args) {
      let friend = Object.assign({}, el) as IFriend;
      friend = this.updateFriend(friend);
      ops.push(this.getUserFriendCollection(friend.userId).then(collection => {
        return collection.replaceOne({ _id: friend._id }, friend)
          .then(result => {
            if (!!result.result.ok) {
              return Promise.resolve();
            }
            return Promise.reject(`Failed to update friend document (id: ${friend._id}).`);
          })
          .catch(err => Promise.reject(err));
      }));
    }
    return Promise.all(ops).then(_ => _[0]);
  }

  searchByText(userId: string, searchComponents: string[]): Promise<IFriend[]> {
    return this.getUserFriendCollection(userId).then(collection =>
      collection.find({ '$text': { '$search': searchComponents.join(' ') } }).toArray()
    ).catch(e => {
      console.log('SEARCH BY TEXT ERROR');
      console.log(e);
      return [];
    });
  }

  private getUserFriendCollection(userId: string): Promise<MongoDB.Collection<IFriend>> {
    return this.getUserCollection<IFriend>(userId);
  }

  // Updating internal data only
  private updateFriend(friend: IFriend): IFriend {
    friend.name.displayName = `${friend.name.first} ${friend.name.last}`;
    friend.whenLastModified = Date.now();
    return friend;
  }

  private createFriend(userId: string, friendArg: IAddFriendArguments, id?: string): IFriend {
    this.validateArguments(friendArg);
    const bday = this.extractBirthday(friendArg.birthday);
    return <IFriend>{
      _id: id || v4(),
      name: {
        first: friendArg.first,
        last: friendArg.last,
        displayName: `${friendArg.first} ${friendArg.last}`,
      },
      birthday: bday && bday.startDate.valueOf(),
      email: friendArg.email,
      phone: friendArg.phone,
      address: {
        address1: friendArg.address1,
        address2: friendArg.address2,
        city: friendArg.city,
        state: friendArg.state,
        country: friendArg.country
      },
      tags: friendArg.tags || [],
      methods: [],
      organization: friendArg.organization,
      skills: [],
      notes: friendArg.firstNote ? [new Note(friendArg.firstNote)] : [],
      userId: userId,
      wasRemoved: false,
      whenAdded: Date.now(),
      whenLastModified: Date.now()
    };
  }

  private extractBirthday(birthdayStr: string): IParsedDate {
    if (!birthdayStr) {
      return undefined;
    }
    const parsed = this.dateParser.parseString(birthdayStr);
    if (!parsed) {
      throw new WhimError(`Cannot parse ${birthdayStr} as a recognizable birthday date.`);
    }
    return parsed;
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
  }

  private genUserCollectionToken(userId: string): string {
    return `${this.collectionTokenPrefix}/${userId}`;
  }

  private getUserCollection<T>(userId: string): Promise<MongoDB.Collection<T>> {
    const token = this.genUserCollectionToken(userId);
    const collection = this.dbMgr.getOrCreateCollection(token) as MongoDB.Collection<T>;
    return collection.createIndex(
      FriendManager.QueryIndexes,
      { name: 'textQuery' }
    ).then(_ => collection)
      .catch((e: Error) => {
        console.log('Error creating text indexes in FriendManager. Reason: ' + e.message);
        console.log('Stack:' + e.stack);
        throw e;
      });
  }
}
