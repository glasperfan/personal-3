import { AccountService } from './account.service';
import { IAddEventArguments, IAddEventsArguments, IDeleteEventsArguments, IEvent, WhimAPI } from '../models';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CalendarService {

  constructor(private http: HttpService, private accountService: AccountService) { }

  public getAllEvents(userId: string) {
    return this.http.get<IEvent[]>(WhimAPI.GetEvents, { userId: userId });
  }

  public addEvents(args: IAddEventArguments[]): Promise<IEvent[]> {
    return this.accountService.currentUser$.then(currentUser => {
      const payload: IAddEventsArguments = { userId: currentUser._id, events: args };
      return this.http.post<IAddEventsArguments, IEvent[]>(WhimAPI.AddEvents, payload);
    });
  }

  public updateEvents(events: IEvent[]): Promise<void> {
    return this.accountService.currentUser$.then(currentUser => {
      return this.http.putOrThrow<IEvent[]>(WhimAPI.UpdateEvents, events);
    });
  }

  public deleteEvents(events: IEvent[]): Promise<void> {
    return this.accountService.currentUser$.then(currentUser => {
      const payload: IDeleteEventsArguments = {
        userId: currentUser._id,
        events: events.map(e => e._id)
      };
      return this.http.postOrThrow<IDeleteEventsArguments>(WhimAPI.DeleteEvents, payload);
    });
  }
}
