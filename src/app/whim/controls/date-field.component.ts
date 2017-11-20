import { FieldComponent } from './field.component';
import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'p3-whim-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.less']
})
export class DateFieldComponent extends FieldComponent<number> implements OnInit {
  @Input() dateFormat = 'MMMM D, YYYY';
  private _lastDate: Date;
  private _dateChanged = false;
  private emptyProperty = 'no date chosen';

  ngOnInit() {
    this.label = this.label || 'Date';
  }

  // To prevent change detection cycles from freezing the app, we cache the Date object
  // rather than create a new one with each call.
  private get _date(): Date {
    if (!this._lastDate || this._dateChanged) {
      this._lastDate = this.value ? new Date(this.value) : undefined;
      this._dateChanged = false;
    }
    return this._lastDate;
  }

  private set _date(d: Date) {
    this.data = d.getTime();
    this._dateChanged = true;
  }
}
