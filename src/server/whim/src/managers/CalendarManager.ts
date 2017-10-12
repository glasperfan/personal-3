import { DateParsingConstants as Constants } from '../parsers/dates/parsing/DateParsingConstants';
import { IParsedDate } from '../models/date';
import { IDateParser } from '../parsers/dates/contracts/IDateParser';
import { OneTimeDate, RecurrentDate } from '../parsers/dates';
import { IAddEventArguments, IAddEventsArguments, IEvent, WhimError, WhimErrorCode } from '../models';
import { DatabaseManager } from '../managers';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';

export class CalendarManager {

  public static readonly QueryIndexes: { [field: string]: string | number } = {
    title: 'text',
    description: 'text'
  };

  private readonly collectionTokenPrefix = 'events';

  constructor(private dbMgr: DatabaseManager, private dateParser: IDateParser) { };

  getEvents(userId: string, includeArchived: boolean): Promise<IEvent[]> {
    const operation = this.getUserEventCollection(userId)
      .then(collection => collection.find({
        userId: userId,
        'date.startDate': { $gte: Constants.StartOfToday().valueOf() }
      }).toArray());
    return operation.then(events => {
      if (!events || !events.length) {
        throw new WhimError(WhimErrorCode.NoEvents);
      }
      return Promise.resolve(events);
    });
  }

  createEvents(args: IAddEventsArguments) {
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

  getUserEventCollection(userId: string): Promise<MongoDB.Collection<IEvent>> {
    return this.getEventCollection<IEvent>(userId);
  }

  private createEvent(args: IAddEventArguments, userId: string): IEvent {
    const parsedDate = this.parseInputDate(args.date);
    return <IEvent>{
      _id: v4(),
      userId: userId,
      title: args.title,
      date: parsedDate,
      description: args.description,
      whenAdded: Date.now(),
      whenLastModified: Date.now()
    };
  }

  private parseInputDate(input: IParsedDate): IParsedDate {
    const isAlternating = input.recurrence.recurEvery.isAlternating;
    const isRecurrent = input.recurrence.isRecurrent;
    const isForever = input.recurrence.recurFor.isForever;
    const recurEvery = input.recurrence.recurEvery;
    const recurFor = input.recurrence.recurFor;
    const parsed = this.dateParser.parseArray([
      input.startInputText,
      isRecurrent ? `every ${recurEvery.pattern.amount} ${recurEvery.pattern.interval}` : '',
      isRecurrent ? (isForever ? 'forever' : `for ${recurFor.pattern.amount} ${recurFor.pattern.interval}(s)`) : ''
    ]);
    if (!parsed) {
      throw new WhimError('Unable to parse a date from user input.');
    }
    return parsed;
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
    ).then(_ => collection);
  }
}
