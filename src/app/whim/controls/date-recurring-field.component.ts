import { DateRelativeFormatPipe } from './date-relative.pipe';
import { Component, OnInit } from '@angular/core';
import { IParsedDate, IRecurrenceUnit } from '../models';
import { FieldComponent } from './field.component';
import * as moment from 'moment';
import { get } from 'lodash';

@Component({
  selector: 'p3-whim-date-recurring-field',
  templateUrl: './date-recurring-field.component.html',
  styleUrls: ['./date-recurring-field.component.less'],
  providers: [DateRelativeFormatPipe]
})
export class RecurringDateFieldComponent extends FieldComponent<IParsedDate> implements OnInit {

  private readonly _recurrenceIntervalArr: [{ value: moment.unitOfTime.Base, displayName: string }] = [
    { value: 'day', displayName: 'day(s)' },
    { value: 'week', displayName: 'week(s)' },
    { value: 'month', displayName: 'month(s)' },
    { value: 'year', displayName: 'year(s)' }
  ];

  private _recurrenceDescription: string;
  private readonly oneTimeDescription = 'once';

  constructor(private relativeDateFormatter: DateRelativeFormatPipe) { super(); }

  ngOnInit() {
    this.label = this.label || 'Date';
    this.updateRecurrenceDescription();
  }

  private get _recurrenceIntervals(): [{ value: moment.unitOfTime.Base, displayName: string }] {
    return this._recurrenceIntervalArr;
  }

  private get _startDate(): number {
    return get(this.value, 'startDate', Date.now());
  }

  private set _startDate(n: number) {
    this.set('startDate', n);
    this.updateEndDate();
  }

  private get _isRecurrent(): boolean {
    return get(this.value, 'recurrence.isRecurrent', false);
  }

  private set _isRecurrent(b: boolean) {
    this.set('recurrence.isRecurrent', b);
    if (b) {
      this._recurEveryAmount = this._recurEveryAmount || 1;
      this._recurEveryInterval = this._recurEveryInterval || 'day';
      this._isForever = true;
    }
    this.updateEndDate();
  }

  private get _recurEveryAmount(): number {
    return get(this.value, 'recurrence.recurEvery.pattern.amount', 1);
  }

  private set _recurEveryAmount(n: number) {
    if (typeof n === 'string') {
      n = parseInt(n, 10);
    }
    n = n < 1 ? 1 : n; // minimum: 1
    this.set('recurrence.recurEvery.pattern.amount', n);
    this.updateEndDate();
  }

  private get _recurEveryInterval(): moment.unitOfTime.Base {
    return get(this.value, 'recurrence.recurEvery.pattern.interval', 'day');
  }

  private set _recurEveryInterval(s: moment.unitOfTime.Base) {
    this.set('recurrence.recurEvery.pattern.interval', s);
  }

  private get _recurForAmount(): number {
    return get(this.value, 'recurrence.recurFor.pattern.amount', 1);
  }

  private set _recurForAmount(n: number) {
    n = n < 1 ? 1 : n; // minimum: 1
    this.set('recurrence.recurFor.pattern.amount', n);
    this.updateRecurrenceDescription();
  }

  private get _recurForInterval(): moment.unitOfTime.Base {
    return get(this.value, 'recurrence.recurFor.pattern.interval', 'day');
  }

  private set _recurForInterval(s: moment.unitOfTime.Base) {
    this.set('recurrence.recurFor.pattern.interval', s);
    this.updateEndDate();
  }

  private get _isForever(): boolean {
    return get(this.value, 'recurrence.recurFor.isForever', true);
  }

  private set _isForever(b: boolean) {
    this.set('recurrence.recurFor.isForever', b);
    this._recurForAmount = undefined;
    this._recurForInterval = undefined;
    this.updateEndDate();
  }

  private get _endDate(): number {
    return get(this.value, 'endDate');
  }

  private updateEndDate() {
    let endDate: number;
    if (!this._isRecurrent) {
      endDate = this._startDate;
    } else if (this._isForever) {
      endDate = Number.MAX_SAFE_INTEGER;
    } else {
      // start date + duration
      endDate = moment(this._startDate, 'x', true)
        .add(this._recurForAmount, this._recurForInterval)
        .valueOf();
    }
    this.set('endDate', endDate);
    this.updateRecurrenceDescription();
  }

  private updateRecurrenceDescription(): void {
    if (!this._isRecurrent) {
      this._recurrenceDescription = this.oneTimeDescription;
    } else {
      let s = `every ${this._recurEveryAmount} ${this._recurEveryInterval}(s)`;
      if (!this._isForever) {
        s += `, ends ${this.relativeDateFormatter.transform(this._endDate)}`;
      }
      this._recurrenceDescription = s;
    }
  }
}
