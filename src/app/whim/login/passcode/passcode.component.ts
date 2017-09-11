import { IError, ILoginResponse, IUser, WindowView, WindowViewWithArgs } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'p3-whim-passcode',
  templateUrl: './passcode.component.html',
  styleUrls: ['./../login.less']
})
export class PasscodeComponent {
  @Input() public args;
  @Output() public switchTo = new EventEmitter<WindowViewWithArgs>();
  public passcodeInput: string;
  private userData: IUser;
  private processMessage: string;

  constructor(private accountService: AccountService) {
    const emailCookie = this.accountService.getEmailCookie();
    this.accountService.getUserByEmail(emailCookie.email)
      .then((userData: IUser) => this.userData = userData);
  }

  private login(): void {
    this.processMessage = 'logging in...';
    this.accountService.login(this.userData.email, this.passcodeInput)
      .then((response: ILoginResponse) => {
        this.accountService.storeEmailCookie(this.userData.email);
        this.accountService.storeAuthCookie(response._id);
        this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
        this.processMessage = undefined;
      })
      .catch((err: IError) => this.processMessage = err.errorMessage);
  }

  private toLogin(): void {
    this.accountService.removeEmailCookie();
    this.accountService.removeAuthCookie();
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Login));
  }
}
