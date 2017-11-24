import { AuthComponent } from '../auth.component';
import { IError, ILoginArguments, ILoginResponse, WindowView, WindowViewWithArgs } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-login',
  templateUrl: './login.component.html',
  styleUrls: ['./../login.less']
})
export class LoginComponent extends AuthComponent<void> {
  private emailInput: string;
  private passcodeInput: string;

  constructor(private accountService: AccountService) { super(); }

  private login(): void {
    this.processMessage = 'logging in...';
    const emailInput = this.emailInput;
    this.accountService.login(emailInput, this.passcodeInput)
      .then((response: ILoginResponse) => {
        this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
        this.processMessage = undefined;
      })
      .catch((err: IError) => this.processMessage = err.errorMessage);
  }

  private toSignup(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Signup));
  }
}
