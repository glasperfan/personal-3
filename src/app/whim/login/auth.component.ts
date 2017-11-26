import { Input, Output, EventEmitter, OnInit } from '@angular/core';
import { WindowViewWithArgs } from '../models';

export abstract class AuthComponent<T> implements OnInit {
  @Input() args: T;
  @Output() public switchTo = new EventEmitter<WindowViewWithArgs>();
  protected readonly passcodeLength = 4;
  protected readonly editMode = true;
  protected processMessage: string;

  ngOnInit() {
    this.args = this.args || <T>{};
  }
}
