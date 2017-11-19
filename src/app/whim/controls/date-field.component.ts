import { IParsedDate } from '../models';
import { FieldComponent } from './field.component';
import { Component } from '@angular/core';
import * as moment from 'moment';
import { get, set } from 'lodash';

@Component({
  selector: 'p3-whim-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.less']
})
export class DateFieldComponent extends FieldComponent<IParsedDate> {

  private _lastStartDate: Date;
  private _startDateChanged = false;

  private get _recurrenceIntervals(): [{ value: moment.unitOfTime.Base, displayName: string }] {
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
      this._lastStartDate = new Date(get(this.value, 'startDate', Date.now()));
      this._startDateChanged = false;
    }
    return this._lastStartDate;
  }

  private set _startDate(d: Date) {
    set(this.value, 'startDate', d.getTime());
    this._startDateChanged = true;
    this.updateEndDate();
  }

  private get _isRecurrent(): boolean {
    return get(this.value, 'recurrence.isRecurrent', false);
  }

  private set _isRecurrent(b: boolean) {
    set(this.value, 'recurrence.isRecurrent', b);
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
    n = n < 1 ? 1 : n; // minimum: 1
    set(this.value, 'recurrence.recurEvery.pattern.amount', n);
  }

  private get _recurEveryInterval(): moment.unitOfTime.Base {
    return get(this.value, 'recurrence.recurEvery.pattern.interval', 'day');
  }

  private set _recurEveryInterval(s: moment.unitOfTime.Base) {
    set(this.value, 'recurrence.recurEvery.pattern.interval', s);
  }

  private get _isAlternating(): boolean {
    return get(this.value, 'recurrence.recurEvery.isAlternating', false);
  }

  private set _isAlternating(b: boolean) {
    set(this.value, 'recurrence.recurEvery.isAlternating', b);
  }

  private get _recurForAmount(): number {
    return get(this.value, 'recurrence.recurFor.pattern.amount', 1);
  }

  private set _recurForAmount(n: number) {
    n = n < 1 ? 1 : n; // minimum: 1
    set(this.value, 'recurrence.recurFor.pattern.amount', n);
    this.updateEndDate();
  }

  private get _recurForInterval(): moment.unitOfTime.Base {
    return get(this.value, 'recurrence.recurFor.pattern.interval', 'day');
  }

  private set _recurForInterval(s: moment.unitOfTime.Base) {
    set(this.value, 'recurrence.recurFor.pattern.interval', s);
    this.updateEndDate();
  }

  private get _isForever(): boolean {
    return get(this.value, 'recurrence.recurFor.isForever', true);
  }

  private set _isForever(b: boolean) {
    set(this.value, 'recurrence.recurFor.isForever', b);
    this.updateEndDate();
  }

  private updateEndDate() {
    let endDate: number;
    if (!this._isRecurrent) {
      endDate = this._startDate.getTime();
    } else if (this._isForever) {
      endDate = Number.MAX_SAFE_INTEGER;
    } else {
      // start date + duration
      endDate = moment(this._startDate, 'x', true)
        .add(this._recurForAmount, this._recurForInterval)
        .valueOf();
    }
    set(this.value, 'endDate', endDate);
  }
}
