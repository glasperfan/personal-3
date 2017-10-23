import { ICalendarManager } from '../../managers/contracts/ICalendarManager';
import { IFriendManager } from '../../managers/contracts/IFriendManager';
import { ICommandParser } from './contracts/ICommandParser';
import { AddFriendParseResult } from './results/AddFriendParseResult';
import { AddEventParseResult } from './results/AddEventParseResult';
import { QueryFriendParseResult } from './results/QueryFriendParseResult';
import { QueryEventParseResult } from './results/QueryEventParseResult';
import { IEvent, IFriend, IParseResult, WhimError } from '../../models';
import { CalendarManager, FriendManager, DatabaseManager } from '../../managers';
import * as moment from 'moment';
import * as MongoDB from 'mongodb';

export class CommandParser implements ICommandParser {
  constructor(
    private friendMgr: IFriendManager,
    private calendarMgr: ICalendarManager) { }

  public parseForSearchResults(searchTerm: string, userId: string): Promise<IParseResult[]> {
    if (!searchTerm || !searchTerm.length || !userId) {
      throw new WhimError('A search term and userId is required');
    }
    // Parse search string into components
    const searchComponents: string[] = searchTerm.trim().split(' ');

    // Add friend/event results
    let results: IParseResult[] = [];
    if (AddFriendParseResult.validate(searchComponents)) {
      results = results.concat(new AddFriendParseResult(searchComponents).AsResult());
    }
    if (AddEventParseResult.validate(searchComponents)) {
      results = results.concat(new AddEventParseResult(searchComponents).AsResult());
    }

    return Promise.all([
      this.friendMgr.searchByText(userId, searchComponents),
      this.calendarMgr.searchByText(userId, searchComponents)
    ]).then(aggregateResults => {
      results = results.concat(aggregateResults[0].map(f =>
        new QueryFriendParseResult(f, searchComponents).AsResult()));
      results = results.concat(aggregateResults[1].map(e =>
        new QueryEventParseResult(e, searchComponents).AsResult()));
      return Promise.resolve(results);
      }).catch(err => {
        return Promise.reject(err);
      });
  }

  private searchByText<T>(collection: MongoDB.Collection<T>, components: string[]): Promise<T[]> {
    return collection.find({ '$text': { '$search': components.join(' ') } })
      .toArray()
      .catch(e => {
        console.log('SEARCH BY TEXT ERROR');
        console.log(e);
        return [];
      });
  }
}
