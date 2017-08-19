import { AuthStatus, IError, ILoginResponse } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-login',
  templateUrl: './login.component.html',
  styleUrls: ['./../login.less']
})
export class LoginComponent {
  public emailInput: string;
  public passcodeInput: string;
  private processMessage: string;

  @Output() authStatusChange = new EventEmitter<AuthStatus>();

  constructor(private accountService: AccountService) {
  }

  private login(): void {
    this.processMessage = 'logging in...';
    const emailInput = this.emailInput;
    this.accountService.login(this.emailInput, this.passcodeInput)
      .then((response: ILoginResponse) => {
        this.accountService.storeEmailCookie(emailInput);
        this.accountService.storeAuthCookie(response._id);
        this.authStatusChange.emit(AuthStatus.Authenticated);
        this.processMessage = undefined;
      })
      .catch((err: IError) => this.processMessage = err.errorMessage);
  }

  private toSignup(): void {
    this.authStatusChange.emit(AuthStatus.Signup);
  }
}
