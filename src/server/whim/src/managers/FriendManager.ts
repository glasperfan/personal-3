import { RecurrentDate } from '../parsers/dates';
import { ICalendarManager } from './contracts/ICalendarManager';
import { IAddEventArguments, IAddEventsArguments, IDeleteFriendsArguments } from '../models/api';
import { IFriendManager } from './contracts/IFriendManager';
import { IDateParser } from '../parsers/dates/contracts/IDateParser';
import { DateParser, Validator } from '../parsers';
import {
    EventCategory,
    Guid,
    IAddFriendArguments,
    IAddFriendsArguments,
    IFriend,
    IGetFriendArguments,
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
  constructor(
    private dbMgr: DatabaseManager,
    private calendarManager: ICalendarManager,
    private dateParser: IDateParser) { };

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
        return this.createBirthdays(args.userId, newFriends)
          .then(_ => newFriends)
          .catch(err => { throw new WhimError(`Failed to create birthday events for new friends. Error: ${err}`); });
      }
      throw new WhimError(`FriendManager: could not create new friends.`);
    });
  }

  updateFriends(args: IFriend[]): Promise<IFriend[]> {
    const ops: Promise<void>[] = [];
    const updated = args.map(el => {
      const f = Object.assign({}, el) as IFriend;
      return this.updateFriend(f);
    });
    for (const friend of updated) {
      // Update friend
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
    return this.updateFriendsBirthdays(updated).then(_ => Promise.all(ops)).then(_ => updated).catch(err => { throw new WhimError(err); });
  }

  deleteFriends(args: IDeleteFriendsArguments): Promise<void> {
    const operation = this.getUserFriendCollection(args.userId)
      .then(collection => collection.deleteMany({
        _id: { $in: args.friendIds }
      }));
    return operation.then(deleted => {
      if (!deleted.result.ok || deleted.deletedCount !== args.friendIds.length) {
        throw new WhimError(
          `FriendManager: unable to delete friends.
          Attempted: ${args.friendIds.length}
          Deleted: ${deleted.deletedCount}`
        );
      }
      return this.deleteFriendsBirthdays(args);
    }).catch(err => {
      throw new WhimError(
        `FriendManager: uncaught exception deleting friends.
          UserId: ${args.userId}
          FriendIds: ${args.friendIds.toString}
          Error: ${err}`
      );
    });
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

  createBirthdays(userId: string, friends: IFriend[]): Promise<void> {
    const events: IAddEventArguments[] = friends.filter(f => !!f.birthday).map(f => {
      return <IAddEventArguments>{
        title: `${f.name.displayName}'s birthday`,
        description: undefined,
        date: new RecurrentDate(f.birthday, undefined, {
          pattern: {
            amount: 1,
            interval: 'year'
          },
          inputText: undefined
        }, {
            pattern: undefined,
            inputText: undefined,
            isForever: true
          }),
        metadata: {
            type: EventCategory.Birthday,
            birthdayFriend: f._id
          }
      };
    });
    const args: IAddEventsArguments = {
      userId: userId,
      events: events
    };
    return Promise.all(friends.map(friend => this.calendarManager.getBirthday(userId, friend._id)))
      .then(birthdays => birthdays.filter(b => !!b))
      .then(birthdays => {
        return this.calendarManager.createEvents({
          userId: userId,
          events: events.filter(e => !birthdays.map(b => b.metadata.birthdayFriend).includes(e.metadata.birthdayFriend))
        });
      }).then(_ => undefined); // error propagates
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
    return <IFriend>{
      _id: id || v4(),
      name: {
        first: friendArg.first,
        last: friendArg.last,
        displayName: `${friendArg.first} ${friendArg.last}`,
      },
      birthday: friendArg.birthday,
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
      notes: friendArg.notes || [],
      userId: userId,
      wasRemoved: false,
      whenAdded: Date.now(),
      whenLastModified: Date.now()
    };
  }

  private updateFriendsBirthdays(friends: IFriend[]): Promise<void> {
    return Promise.all(friends.filter(f => !!f.birthday).map((friend: IFriend) =>
      this.calendarManager.getBirthday(friend.userId, friend._id)
        .then(birthday => {
          // End date is fine since birthdays never end :) in a sense
          birthday.date.startDate = friend.birthday;
          return this.calendarManager.updateEvents([birthday]);
        })
    )).then(_ => undefined);
  }

  private deleteFriendsBirthdays(args: IDeleteFriendsArguments): Promise<void> {
    if (!args.friendIds.length) {
      return Promise.resolve();
    }
    return Promise.all(args.friendIds.map((friendId: Guid) =>
      this.calendarManager.getBirthday(args.userId, friendId)
        .then(birthday => !!birthday ? birthday._id : undefined)))
        .then(results => results.filter(b => !!b))
        .then(birthdaysToDelete => this.calendarManager.deleteEvents({
          userId: args.userId,
          events: birthdaysToDelete
        }));
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
