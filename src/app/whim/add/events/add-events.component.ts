import { CalendarService } from '../../services/calendar.service';
import { IAddEventArguments, IError, IEvent, WindowView, WindowViewWithArgs, WhimErrorCode } from '../../models';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'p3-whim-add-events',
  templateUrl: './add-events.component.html',
  styleUrls: ['./add-events.component.less'],
  providers: [CalendarService]
})
export class AddCalendarEventsComponent implements OnInit {
  @Input() args: IAddEventArguments;
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();

  private readonly title = 'Add Events';
  private readonly description = `A friend's birthday? A reminder to send a note of support? Remember that important moment in a friend's life.`;
  private readonly UnableToParseDateErrorMessage = `Not sure what date that is. Try 'today', 'now', 'tomorrow', 'next week', or a date like 'Feb 27 2017`;
  private readonly UnknownErrorMessage = 'Something went wrong... contact Hugh :/';
  private readonly Now: Date = new Date();
  private processMessage: string;


  constructor(private calendarService: CalendarService) { }

  ngOnInit() {
    this.args = this.args || this.defaultInput();
  }

  private toDashboard(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
  }

  private addCalendarEvent(): void {
    // quick validation
    if (!this.args.title) {
      this.processMessage = 'An event title is required';
    } else if (!this.args.date) {
      this.processMessage = 'A date is required';
    } else {
      this.args.date = this.parseDate(<any>this.args.date);
      this.calendarService.addEvents([this.args])
        .then((addedEvents: IEvent[]) => {
          this.processMessage = `${addedEvents[0].title} on ${this.formatDate(addedEvents[0].date.baseDate)}, got it!`;
          this.args = this.defaultInput();
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

  private defaultInput(): IAddEventArguments {
    return <any>{ date: this.getDefaultDate() };
  }

  private formatDate(timestamp: number | string, format: string = 'MMMM Do YYYY, h:mm a'): string {
    return moment(timestamp).format(format);
  }

  private getDefaultDate(): string {
    return moment(this.Now).format('YYYY-MM-DDTHH:mm');
  }

  private parseDate(dateString: string): number {
    return new Date(dateString).getTime();
  }
}
