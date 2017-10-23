import { IEvent, IAddEventsArguments, IDeleteEventsArguments } from '../../src/models';
import { ICalendarManager } from '../../src/managers/contracts/ICalendarManager';

export class FakeCalendarManager implements ICalendarManager {

  public getEvents(userId: string, includeArchived: boolean): Promise<IEvent[]> {
      throw new Error('Not implemented yet.');
  }

  public createEvents(args: IAddEventsArguments): Promise<IEvent[]> {
      throw new Error('Not implemented yet.');
  }

  public deleteEvents(args: IDeleteEventsArguments): Promise<void> {
      throw new Error('Not implemented yet.');
  }

  public searchByText(userId: string, searchComponents: string[]): Promise<IEvent[]> {
      throw new Error('Not implemented yet.');
  }
}
