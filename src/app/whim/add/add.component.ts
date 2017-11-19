import { OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WindowViewWithArgs, WindowView, IField } from 'app/whim/models';
import { set } from 'lodash';

export abstract class AddComponent<T> implements OnInit {
  @Input() args: T;
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();
  protected title: string;
  protected processMessage: string;

  ngOnInit() {
    this.args = this.args || <T>{};
  }

  protected toDashboard(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
  }

  protected updateField(update: IField): void {
    set(this.args, update.field, update.value);
  }
}
