import { WindowViewWithArgs, WindowView, IField } from '../models';
import { Input, Output, EventEmitter } from '@angular/core';
import { set } from 'lodash';

export abstract class ShowComponent<T> {
  @Input() args: T;
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();
  protected title: string;
  protected editMode = false;
  protected snapshot: T;
  protected processMessage: string;

  protected toDashboard(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
  }

  protected updateField(update: IField): void {
    set(this.args, update.field, update.value);
  }

  protected toEditMode(): void {
    this.editMode = true;
    this.snapshot = JSON.parse(JSON.stringify(this.args)); // deep clones (only properties, not functions)
  }

  protected toShowMode(): void {
    this.editMode = false;
  }
  protected cancel(): void {
    this.args = JSON.parse(JSON.stringify(this.snapshot)); // deep clones (only properties, not functions)
    this.toShowMode();
  }

  protected abstract submitChanges(): void;
  protected abstract delete(): void;
}