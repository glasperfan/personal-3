import { IError, ILoginResponse, WindowView, WindowViewWithArgs } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-login',
  templateUrl: './login.component.html',
  styleUrls: ['./../login.less']
})
export class LoginComponent {
  @Input() public args;
  @Output() public switchTo = new EventEmitter<WindowViewWithArgs>();
  public emailInput: string;
  public passcodeInput: string;
  private processMessage: string;


  constructor(private accountService: AccountService) {
  }

  private login(): void {
    this.processMessage = 'logging in...';
    const emailInput = this.emailInput;
    this.accountService.login(this.emailInput, this.passcodeInput)
      .then((response: ILoginResponse) => {
        this.accountService.storeEmailCookie(emailInput);
        this.accountService.storeAuthCookie(response._id);
        this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
        this.processMessage = undefined;
      })
      .catch((err: IError) => this.processMessage = err.errorMessage);
  }

  private toSignup(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Signup));
  }
}
