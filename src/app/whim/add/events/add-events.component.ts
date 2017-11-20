import { AddComponent } from '../add.component';
import { CalendarService } from '../../services/calendar.service';
import {
    IAddEventArguments,
    IError,
    IEvent,
    IParsedDate,
    WhimErrorCode,
    WindowView,
    WindowViewWithArgs,
} from '../../models';
import { Component } from '@angular/core';
import { get, set } from 'lodash';

@Component({
  selector: 'p3-whim-add-events',
  templateUrl: './add-events.component.html',
  styleUrls: ['./add-events.component.less'],
  providers: [CalendarService]
})
export class AddCalendarEventsComponent extends AddComponent<IAddEventArguments> {
  protected readonly title = 'Add Events';
  private readonly UnableToParseDateErrorMessage = `Not sure what date that is. Try 'today', 'now', 'tomorrow', 'next week', or a date like 'Feb 27 2017`;
  private readonly UnknownErrorMessage = 'Something went wrong... contact Hugh :/';

  constructor(private calendarService: CalendarService) { super(); }

  protected add(): void {
    // quick validation
    if (!this.args.title) {
      this.processMessage = 'An event title is required';
    } else if (!this.args.date) {
      this.processMessage = 'A date is required';
    } else {
      this.calendarService.addEvents([this.args])
        .then((addedEvents: IEvent[]) => {
          this.toEditEvent(addedEvents[0]);
          this.args = <any>{};
        })
        .catch((err: IError) => {
          switch (err.errorMessage as WhimErrorCode) {
            case WhimErrorCode.UnableToParseDate: this.processMessage = err.errorMessage; break;
            default: this.processMessage = this.UnknownErrorMessage;
          };
          Promise.resolve(undefined);
        });
    }
  }

  private toEditEvent(event: IEvent): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.ShowEvents, event));
  }

  private get _title(): string {
    return get(this.args, 'title', undefined);
  }

  private set _title(s: string) {
    set(this.args, 'title', s);
  }

  private get _description(): string {
    return get(this.args, 'description');
  }

  private set _description(s: string) {
    set(this.args, 'description', s);
  }

  private get _date(): IParsedDate {
    return get(this.args, 'date');
  }

  private set _date(d: IParsedDate) {
    set(this.args, 'date', d);
  }

  // TODO: tags
}
