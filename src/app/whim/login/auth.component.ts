import { Input, Output, EventEmitter } from '@angular/core';
import { WindowViewWithArgs } from '../models';

export abstract class AuthComponent<T> {
  @Input() args: T;
  @Output() public switchTo = new EventEmitter<WindowViewWithArgs>();
  protected readonly passcodeLength = 4;
  protected readonly editMode = true;
  protected processMessage: string;
}
