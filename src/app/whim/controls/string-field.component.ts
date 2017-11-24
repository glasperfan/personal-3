import { Component, Input } from '@angular/core';
import { FieldComponent } from './field.component';
import { IField } from '../models';

@Component({
  selector: 'p3-whim-string-field',
  templateUrl: './string-field.component.html',
  styleUrls: ['./string-field.component.less']
})
export class StringFieldComponent extends FieldComponent<string> {
  @Input() isPasscode = false;
  private readonly passcodeLength = 4;
  private readonly emptyProperty = 'undefined';
}
