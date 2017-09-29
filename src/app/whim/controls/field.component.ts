import { Input, Output, EventEmitter } from '@angular/core';
import { IField } from 'app/whim/models';

export class FieldComponent<T> {
  @Input() label: string;
  @Input() field: string;
  @Input() editMode: boolean;
  @Input() showControls = false;
  @Output() onChange = new EventEmitter<IField>();
  @Input() showIfEmpty = false;
  @Input() set initialValue(initialValue: T) {
    this.value = initialValue;
  }

  get shouldShow(): boolean {
    return this.showIfEmpty || this.editMode || !!this.value;
  }

  protected value: T;
}
