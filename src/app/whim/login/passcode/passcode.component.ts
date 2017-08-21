import { IError, ILoginResponse, IUser, WindowView } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'p3-whim-passcode',
  templateUrl: './passcode.component.html',
  styleUrls: ['./../login.less']
})
export class PasscodeComponent {
  public passcodeInput: string;
  private userData: IUser;
  private processMessage: string;
  @Output() switchTo = new EventEmitter<WindowView>();

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
        this.switchTo.emit(WindowView.Dashboard);
        this.processMessage = undefined;
      })
      .catch((err: IError) => this.processMessage = err.errorMessage);
  }

  private toLogin(): void {
    this.accountService.removeEmailCookie();
    this.accountService.removeAuthCookie();
    this.switchTo.emit(WindowView.Login);
  }
}
