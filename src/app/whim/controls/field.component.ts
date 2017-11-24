import { Input, Output, EventEmitter } from '@angular/core';
import { IField } from 'app/whim/models';
import { get, set } from 'lodash';

export class FieldComponent<T> {
  value: T;
  @Input() label: string;
  @Input() iconLabel: string;
  @Input() placeholder: string;
  @Input() labelClass: string;
  @Input() editMode: boolean;
  @Input() showOn = true;
  @Input() showControls = false;
  @Input() showIfEmpty = false;

  // Two-way binding
  @Input() get data(): T { return this.value; }
  @Output() dataChange = new EventEmitter<T>();
  set data(val: T) {
    this.value = val;
    this.dataChange.emit(val);
  }

  // Set object
  set(field: string, value: any) {
    if (get(this.value, field) !== value) {
      set(this.value, field, value);
      this.dataChange.emit(this.value);
    }
  }

  // Override for non-primitive (for value existence check)
  get shouldShow(): boolean {
    return this.showOn && (this.showIfEmpty || this.editMode || !!this.value);
  }

  edit(): void {
    this.editMode = true;
  }

  finishEdit(): void {
    this.editMode = false;
  }
}
