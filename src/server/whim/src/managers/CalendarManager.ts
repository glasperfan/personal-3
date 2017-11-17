import { IDeleteEventsArguments } from '../models/api';
import { DateParsingConstants as Constants } from '../parsers/dates/parsing/DateParsingConstants';
import { IParsedDate } from '../models/date';
import { IDateParser } from '../parsers/dates/contracts/IDateParser';
import { OneTimeDate, RecurrentDate } from '../parsers/dates';
import { IAddEventArguments, IAddEventsArguments, IEvent, WhimError, WhimErrorCode } from '../models';
import { DatabaseManager } from '../managers';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';

export class CalendarManager {

  private static readonly QueryIndexes: { [field: string]: string | number } = {
    title: 'text',
    description: 'text'
  };

  private readonly collectionTokenPrefix = 'events';

  constructor(private dbMgr: DatabaseManager, private dateParser: IDateParser) { };

  getEvents(userId: string, includeArchived: boolean): Promise<IEvent[]> {
    const operation = this.getUserEventCollection(userId)
      .then(collection => collection.find({
        userId: userId,
        'date.endDate': { $gt: Constants.StartOfToday().valueOf() }
      }).toArray());
    return operation.then(events => {
      if (!events || !events.length) {
        throw new WhimError(WhimErrorCode.NoEvents);
      }
      return Promise.resolve(events);
    });
  }

  createEvents(args: IAddEventsArguments): Promise<IEvent[]> {
    const newEvents: IEvent[] = args.events.map(e => this.createEvent(e, args.userId));
    const operation = this.getUserEventCollection(args.userId)
      .then(collection => collection.insertMany(newEvents));
    return operation.then(write => {
      if (!!write.result.ok) {
        return newEvents;
      }
      throw new WhimError(`CalendarManager: could not create new events.`);
    });
  }

  deleteEvents(args: IDeleteEventsArguments): Promise<void> {
    const operation = this.getUserEventCollection(args.userId)
      .then(collection => collection.deleteMany({
        _id: { $in: args.events }
      }));
    return operation.then(deleted => {
      if (!deleted.result.ok || deleted.deletedCount !== args.events.length) {
        throw new WhimError(`CalendarManager: unable to delete events (attempted ${args.events.length}, succeeded for ${deleted.deletedCount}`);
      }
      return undefined;
    });
  }

  updateEvents(args: IEvent[]): Promise<void> {
    const ops: Promise<void>[] = [];
    for (const ev of args) {
      let event = Object.assign({}, ev) as IEvent;
      event = this.updateEvent(event);
      ops.push(this.getUserEventCollection(event.userId).then(collection => {
        return collection.replaceOne({ _id: event._id }, event)
          .then(result => {
            if (!!result.result.ok) {
              return Promise.resolve();
            }
            return Promise.reject(`Failed to update friend document (id: ${event._id}).`);
          })
          .catch(err => Promise.reject(err));
      }));
    }
    return Promise.all(ops).then(_ => _[0]);
  }

  // Updating internal data only
  updateEvent(event: IEvent): IEvent {
    // TODO: handle date
    event.whenLastModified = Date.now();
    return event;
  }

  searchByText(userId: string, searchComponents: string[]): Promise<IEvent[]> {
    return this.getUserEventCollection(userId).then(collection =>
      collection.find({ '$text': { '$search': searchComponents.join(' ') } }).toArray()
    ).catch(e => {
      console.log('SEARCH BY TEXT ERROR');
      console.log(e);
      return [];
    });
  }

  private getUserEventCollection(userId: string): Promise<MongoDB.Collection<IEvent>> {
    return this.getEventCollection<IEvent>(userId);
  }

  private createEvent(args: IAddEventArguments, userId: string): IEvent {
    return <IEvent>{
      _id: v4(),
      userId: userId,
      title: args.title,
      date: args.date,
      description: args.description,
      whenAdded: Date.now(),
      whenLastModified: Date.now()
    };
  }

  private genEventCollectionToken(userId: string): string {
    return `${this.collectionTokenPrefix}/${userId}`;
  }

  private getEventCollection<T>(userId: string): Promise<MongoDB.Collection<T>> {
    const token = this.genEventCollectionToken(userId);
    const collection = this.dbMgr.getOrCreateCollection(token) as MongoDB.Collection<T>;
    return collection.createIndex(
      CalendarManager.QueryIndexes,
      { name: 'textQuery' }
    ).then(_ => collection)
      .catch((e: Error) => {
        console.log('Error creating text indexes in FriendManager. Reason: ' + e.message);
        console.log('Stack:' + e.stack);
        throw e;
      });
  }
}
