import { AuthComponent } from '../auth.component';
import { IError, ISignupArguments, ISignupResponse, WindowView, WindowViewWithArgs } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';

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
    if (this.args.passcode !== this.confirmationPasscode) {
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
}
