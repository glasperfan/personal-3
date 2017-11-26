import { AuthComponent } from '../auth.component';
import { IError, ISignupArguments, ISignupResponse, WindowView, WindowViewWithArgs } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { get, set } from 'lodash';

@Component({
  selector: 'p3-whim-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./../login.less']
})
export class SignupComponent extends AuthComponent<ISignupArguments> {
  @Output() public switchTo = new EventEmitter<WindowViewWithArgs>();
  private confirmationPasscode: string;

  constructor(private accountService: AccountService) { super(); }

  private signup(): void {
    // Basic validation
    if (this._passcode !== this.confirmationPasscode) {
        this.processMessage = `The passcodes don't match.`;
        return;
    }
    this.processMessage = 'getting set up...';
    this.accountService.signup(this.args)
      .then((response: ISignupResponse) => {
        if (response && response._id) {
          this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
          this.processMessage = undefined;
        }
      })
      .catch((err: IError) => {
        this.processMessage = err.errorMessage;
      });
  }

  private toLogin(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Login));
  }

  private get _first(): string {
    return get(this.args, 'first');
  }

  private set _first(s: string) {
    set(this.args, 'first', s);
  }

  private get _last(): string {
    return get(this.args, 'last');
  }

  private set _last(s: string) {
    set(this.args, 'last', s);
  }

  private get _email(): string {
    return get(this.args, 'email');
  }

  private set _email(s: string) {
    set(this.args, 'email', s);
  }

  private get _city(): string {
    return get(this.args, 'city');
  }

  private set _city(s: string) {
    set(this.args, 'city', s);
  }

  private get _passcode(): string {
    return get(this.args, 'passcode');
  }

  private set _passcode(s: string) {
    set(this.args, 'passcode', s);
  }

  private get _passcodesMatch(): boolean {
    return !!this._passcode && !!this.confirmationPasscode
      && this._passcode.length === this.passcodeLength
      && this._passcode === this.confirmationPasscode;
  }
}
