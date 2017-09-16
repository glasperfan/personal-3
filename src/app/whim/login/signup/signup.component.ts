import { IError, ISignupArguments, ISignupResponse, WindowView, WindowViewWithArgs } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./../login.less']
})
export class SignupComponent {
  @Output() public switchTo = new EventEmitter<WindowViewWithArgs>();
  private _args: ISignupArguments;
  private confirmationPasscode: string;
  private processMessage: string;

  constructor(private accountService: AccountService) {
    this.args = undefined;
  }

  @Input() public set args(args: ISignupArguments) {
    this._args = args || <any>{};
  }

  public get args(): ISignupArguments {
    return this._args;
  }

  private signup(): void {
    // Basic validation
    if (this.args.passcode !== this.confirmationPasscode) {
        this.processMessage = `The passcodes don't match.`;
        return;
    }
    this.processMessage = 'getting set up...';
    const inputEmail = this.args.email;
    this.accountService.signup(this.args)
      .then((response: ISignupResponse) => {
        this.accountService.storeEmailCookie(inputEmail);
        this.accountService.storeAuthCookie(response._id);
        this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
        this.processMessage = undefined;
      })
      .catch((err: IError) => {
        this.processMessage = err.errorMessage;
      });
  }

  private toLogin(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Login));
  }
}
