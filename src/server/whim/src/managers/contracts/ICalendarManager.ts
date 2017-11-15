import { IAddEventsArguments, IDeleteEventsArguments, IEvent } from '../../models';
export interface ICalendarManager {
  getEvents(userId: string, includeArchived: boolean): Promise<IEvent[]>;
  createEvents(args: IAddEventsArguments): Promise<IEvent[]>;
  updateEvents(args: IEvent[]): Promise<void>;
  deleteEvents(args: IDeleteEventsArguments): Promise<void>;
  searchByText(userId: string, searchComponents: string[]): Promise<IEvent[]>;
}
