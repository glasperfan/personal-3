import { OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WindowViewWithArgs, WindowView, IField } from 'app/whim/models';
import { set } from 'lodash';

export abstract class AddComponent<T> implements OnInit {
  @Input() args: T;
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();
  protected title: string;
  protected processMessage: string;
  protected editMode = true;

  ngOnInit() {
    this.args = this.args || <T>{};
  }

  protected toDashboard(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
  }

  protected abstract add(): void;
}
