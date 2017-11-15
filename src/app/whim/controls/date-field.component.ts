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

  get _date(): string {
    return moment(get(this.value, 'startDate'), 'x', true).format('x'); // TODO: provide date picker
  }

  set _date(s: string) {
    set(this.value, 'startDate', moment(s, 'x', true).valueOf());
  }

  get _recurs(): boolean {
    return get(this.value, 'recurrence.isRecurrent', false);
  }

  set _recurs(b: boolean) {
    set(this.value, 'recurrence.isRecurrent', b);
  }

  get _recurEveryAmount(): number {
    return get(this.value, 'recurrence.recurEvery.pattern.amount', 1);
  }

  set _recurEveryAmount(n: number) {
    set(this.value, 'recurrence.recurEvery.pattern.amount', n);
  }

  get _recurEveryInterval(): string {
    return get(this.value, 'recurrence.recurEvery.pattern.interval', 'week(s)');
  }

  set _recurEveryInterval(s: string) {
    set(this.value, 'recurrence.recurEvery.pattern.interval', s);
  }

  get _recurForAmount(): number {
    return get(this.value, 'recurrence.recurFor.pattern.amount', 1);
  }

  set _recurForAmount(n: number) {
    set(this.value, 'recurrence.recurFor.pattern.amount', n);
  }

  get _recurForInterval(): string {
    return get(this.value, 'recurrence.recurFor.pattern.interval', 'week(s)');
  }

  set _recurForInterval(s: string) {
    set(this.value, 'recurrence.recurFor.pattern.interval', s);
  }

  get _alternates(): boolean {
    return get(this.value, 'recurrence.recurEvery.isAlternating', false);
  }

  set _alternates(b: boolean) {
    set(this.value, 'recurrence.recurEvery.isAlternating', b);
  }

  get _forever(): boolean {
    return get(this.value, 'recurrence.recurFor.isForever', false);
  }

  set _forever(b: boolean) {
    set(this.value, 'recurrence.recurFor.isForever', b);
  }
}
