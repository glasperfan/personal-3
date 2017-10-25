import { AccountService } from '../services/account.service';
import { IError, IEvent, IUser, WhimErrorCode } from '../models';
import { CalendarService } from '../services/calendar.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'p3-whim-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.less'],
  providers: [CalendarService]
})
export class CalendarComponent implements OnInit {
  private userEvents$: Promise<IEvent[]>;
  private errorMessage: string;
  private readonly noEventsErrorMessage = 'You have no upcoming events! (Not even a friend\'s birthday?) Add one above.';
  private readonly UnknownErrorMessage = 'Something went wrong... contact Hugh :/';

  constructor(private accountService: AccountService, private calendarService: CalendarService) { }

  ngOnInit() {
    this.accountService.currentUser$.then(user => {
      if (user) {
        this.userEvents$ = this.calendarService.getAllEvents(user._id)
          .then(events => events.sort((a, b) => a.date.startDate - b.date.startDate)) // sort by date
          .catch((err: IError) => {
            switch (err.errorMessage as WhimErrorCode) {
              case WhimErrorCode.NoEvents:
                this.errorMessage = this.noEventsErrorMessage;
                break;
              default:
                this.errorMessage = this.UnknownErrorMessage;
            }
            return Promise.resolve([]);
          });
      }
    });
  }
}
