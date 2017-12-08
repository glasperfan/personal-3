import { AccountService } from '../services/account.service';
import { IError, IEvent, IUser, WhimErrorCode, WindowView, WindowViewWithArgs, IParsedDate, IRecurrenceUnit } from '../models';
import { CalendarService } from '../services/calendar.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'p3-whim-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.less'],
  providers: [CalendarService]
})
export class CalendarComponent implements OnInit {
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();
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

  // Return a timestamp
  nextOccurrence(d: IParsedDate): number {
    if (!d.recurrence.isRecurrent) {
      return d.startDate;
    }
    if (!d.recurrence.recurEvery || !d.recurrence.recurEvery.pattern) {
      throw new Error('Missing recurrence pattern on a recurring date!');
    }
    const startOfToday = moment().startOf('day');
    const current = moment(d.startDate, 'x', true);
    while (current < startOfToday) {
      current.add(
        d.recurrence.recurEvery.pattern.amount,
        d.recurrence.recurEvery.pattern.interval
      );
    }
    const nextOccurrence = current.valueOf();
    if (nextOccurrence > d.endDate) {
      throw new Error('Something is wrong with this date...');
    }
    return nextOccurrence;
  }

  // 1 day/week/month/year => daily/weekly/monthly/yearly
  // 2 days/weeks/months/years => every other day/week/month/year
  // 3+(N) days/weeks/months/years => every N days/weeks/months/years
  formatRecurrence(pattern: IRecurrenceUnit): string {
    switch (pattern.amount) {
      case 1:
        return pattern.interval === 'day' ? 'daily' : pattern.interval + 'ly';
      case 2:
        return 'every other ' + pattern.interval;
      default:
        return `every ${pattern.amount} ${pattern.interval}s`;
    }
  }

  goToEvent(e: IEvent): void {
    this.switchTo.emit({ window: WindowView.ShowEvents, args: e });
  }
}
