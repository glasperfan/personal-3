import { FieldComponent } from './field.component';
import { IField } from '../models';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-string-field',
  templateUrl: './string-field.component.html',
  styleUrls: ['./string-field.component.less']
})
export class StringFieldComponent extends FieldComponent<string> implements OnInit {
  private readonly emptyProperty = 'undefined';

  ngOnInit() {
  }

  update(newValue: string): void {
    const field = this.field;
    this.value = newValue;
    this.onChange.emit({ field: this.field, value: newValue });
  }

  edit(): void {
    this.editMode = true;
  }

  finishEdit(): void {
    this.editMode = false;
  }
}
