import { IAddEventArguments, IAddEventsArguments, IEvent, WhimError, WhimErrorCode } from './models';
import { DatabaseManager } from './database-mgr';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';

export class CalendarManager {

  private readonly collectionTokenPrefix = 'events';

  constructor(private dbMgr: DatabaseManager) { };

  getEvents(userId: string, includeArchived: boolean): Promise<IEvent[]> {
    return this.getUserEventCollection(userId).find({
      userId: userId,
      date: { $gte: Date.now() }
    }).toArray().then(events => {
      if (!events || !events.length) {
        throw new WhimError(WhimErrorCode.NoEvents);
      }
      return Promise.resolve(events);
    });
  }

  createEvents(args: IAddEventsArguments) {
    const newEvents: IEvent[] = args.events.map(e => this.createEvent(e, args.userId));
    return this.getUserEventCollection(args.userId)
    .insertMany(newEvents).then(write => {
      if (!!write.result.ok) {
        return newEvents;
      }
      throw new WhimError(`CalendarManager: could not create new events.`);
    });
  }

  getUserEventCollection(userId: string): MongoDB.Collection<IEvent> {
    return this.getEventCollection<IEvent>(userId);
  }

  private createEvent(args: IAddEventArguments, userId: string): IEvent {
    return <IEvent>{
      _id: v4(),
      userId: userId,
      title: args.title,
      nextDate: { recurrent: false, baseDate: args.date },
      description: args.description,
      whenAdded: new Date(),
      whenLastModified: new Date()
    };
  }

  private genEventCollectionToken(userId: string): string {
    return `${this.collectionTokenPrefix}/${userId}`;
  }

  private getEventCollection<T>(userId: string): MongoDB.Collection<T> {
    const token = this.genEventCollectionToken(userId);
    return this.dbMgr.getOrCreateCollection(token) as MongoDB.Collection<T>;
  }
}
