import { CalendarService } from '../../services/calendar.service';
import { IAddEventArguments, IError, IEvent, WhimErrorCode, WindowView, WindowViewWithArgs } from '../../models';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

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
  private _lastStartDate: Date;
  private _startDateChanged = false;
  private processMessage: string;


  constructor(private calendarService: CalendarService) { }

  ngOnInit() {
    this.args = this.args || <any>{};
  }

  private toDashboard(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
  }

  private toEditEvent(event: IEvent): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.ShowEvents, event));
  }

  private addCalendarEvent(): void {
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

  private formatDate(timestamp: number | string, format: string = 'MMMM Do YYYY, h:mm a'): string {
    return moment(timestamp, 'x', true).format(format);
  }

  private get _recurrenceIntervals(): any[] {
    return [
      { value: 'day', displayName: 'day(s)' },
      { value: 'week', displayName: 'week(s)' },
      { value: 'month', displayName: 'month(s)' },
      { value: 'year', displayName: 'year(s)' }
    ];
  }

  // To prevent change detection cycles from freezing the app, we cache the Date object
  // rather than create a new one with each call.
  private get _startDate(): Date {
    if (!this._lastStartDate || this._startDateChanged) {
      this._lastStartDate = new Date(_.get(this.args, 'date.startDate', Date.now()));
      this._startDateChanged = false;
    }
    return this._lastStartDate;
  }

  private set _startDate(d: Date) {
    _.set(this.args, 'date.startDate', d.getTime());
    this._startDateChanged = true;
  }

  private get _title(): string {
    return _.get(this.args, 'title', undefined);
  }

  private set _title(s: string) {
    _.set(this.args, 'title', s);
  }

  private get _description(): string {
    return _.get(this.args, 'description', undefined);
  }

  private set _description(s: string) {
    _.set(this.args, 'description', s);
  }

  private get _isRecurrent(): boolean {
    return _.get(this.args, 'date.recurrence.isRecurrent', false);
  }

  private set _isRecurrent(b: boolean) {
    _.set(this.args, 'date.recurrence.isRecurrent', b);
    if (b) {
      this._recurEveryAmount = this._recurEveryAmount || 1;
      this._recurEveryInterval = this._recurEveryInterval || 'day';
      this._isForever = true;
    }
  }

  private get _recurEveryAmount(): number {
    return _.get(this.args, 'date.recurrence.recurEvery.pattern.amount', 1);
  }

  private set _recurEveryAmount(n: number) {
    n = n < 1 ? 1 : n; // minimum: 1
    _.set(this.args, 'date.recurrence.recurEvery.pattern.amount', n);
  }

  private get _recurEveryInterval(): string {
    return _.get(this.args, 'date.recurrence.recurEvery.pattern.interval', 'day');
  }

  private set _recurEveryInterval(s: string) {
    _.set(this.args, 'date.recurrence.recurEvery.pattern.interval', s);
  }

  private get _isAlternating(): boolean {
    return _.get(this.args, 'date.recurrence.recurEvery.isAlternating', false);
  }

  private set _isAlternating(b: boolean) {
    _.set(this.args, 'date.recurrence.recurEvery.isAlternating', b);
  }

  private get _recurForAmount(): number {
    return _.get(this.args, 'date.recurrence.recurFor.pattern.amount', 1);
  }

  private set _recurForAmount(n: number) {
    n = n < 1 ? 1 : n; // minimum: 1
    _.set(this.args, 'date.recurrence.recurFor.pattern.amount', n);
  }

  private get _recurForInterval(): string {
    return _.get(this.args, 'date.recurrence.recurFor.pattern.interval', 'day');
  }

  private set _recurForInterval(s: string) {
    _.set(this.args, 'date.recurrence.recurFor.pattern.interval', s);
  }

  private get _isForever(): boolean {
    return _.get(this.args, 'date.recurrence.recurFor.isForever', true);
  }

  private set _isForever(b: boolean) {
    _.set(this.args, 'date.recurrence.recurFor.isForever', b);
  }
}
