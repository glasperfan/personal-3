import { FieldComponent } from './field.component';
import { Component } from '@angular/core';

@Component({
  selector: 'p3-whim-multiline-field',
  templateUrl: './multiline-field.component.html',
  styleUrls: ['./multiline-field.component.less']
})
export class MultilineFieldComponent extends FieldComponent<string> {

  private readonly emptyProperty = '';

  private updateValue(newValue: string): void {
    this.value = newValue;
    this.onChange.emit({ field: this.field, value: newValue });
  }

}
