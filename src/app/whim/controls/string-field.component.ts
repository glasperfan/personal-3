import { FieldComponent } from './field.component';
import { IField } from '../models';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-string-field',
  templateUrl: './string-field.component.html',
  styleUrls: ['./string-field.component.less']
})
export class StringFieldComponent extends FieldComponent<string> {
  private readonly emptyProperty = 'undefined';

  update(newValue: string): void {
    this.value = newValue;
    this.onChange.emit({ field: this.field, value: newValue });
  }
}
