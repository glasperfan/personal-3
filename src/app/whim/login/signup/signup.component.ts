import { IError, ISignupArguments, ISignupResponse, WindowView } from '../../models';
import { AccountService } from '../../services/account.service';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./../login.less']
})
export class SignupComponent {
  public userInput: ISignupArguments;
  private processMessage: string;

  @Output() switchTo = new EventEmitter<WindowView>();

  constructor(private accountService: AccountService) {
    this.userInput = {
      first: undefined,
      last: undefined,
      email: undefined,
      passcode: undefined
    };
  }

  private signup(): void {
    this.processMessage = 'getting set up...';
    const inputEmail = this.userInput.email;
    this.accountService.signup(this.userInput)
      .then((response: ISignupResponse) => {
        this.accountService.storeEmailCookie(inputEmail);
        this.accountService.storeAuthCookie(response._id);
        this.switchTo.emit(WindowView.Dashboard);
        this.processMessage = undefined;
      })
      .catch((err: IError) => {
        this.processMessage = err.errorMessage;
      });
  }

  private toLogin(): void {
    this.switchTo.emit(WindowView.Login);
  }
}
