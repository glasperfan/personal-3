import { AuthComponent } from '../auth.component';
import { IError, ILoginResponse, IUser, WindowView, WindowViewWithArgs } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'p3-whim-passcode',
  templateUrl: './passcode.component.html',
  styleUrls: ['./../login.less']
})
export class PasscodeComponent extends AuthComponent<string> {
  public passcodeInput: string;
  private userEmail: string;

  constructor(private accountService: AccountService) {
    super();
    this.getLoggedInUserEmailIfExists();
  }

  // TODO: move this to whoever calls for this component, and have email passed as an argument.
  private getLoggedInUserEmailIfExists(): void {
    this.accountService.getLastLoggedInUser().then(user => {
      if (!user) {
        this.toLogin();
      } else {
        this.userEmail = user.email;
      }
    });
  }

  private login(): void {
    if (!this.userEmail) {
      this.toLogin();
    } else if (!this.passcodeInput) {
      return;
    } else {
      this.processMessage = 'logging in...';
      this.accountService.login(this.userEmail, this.passcodeInput)
        .then((response: ILoginResponse) => {
          this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
          this.processMessage = undefined;
        })
        .catch((err: IError) => this.processMessage = err.errorMessage);
    }
  }

  private toLogin(): void {
    this.accountService.logout();
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Login));
  }
}
