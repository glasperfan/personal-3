import { AuthStatus } from '../models';
import { AccountService } from '../services/account.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'p3-whim',
  templateUrl: './whim.component.html',
  styleUrls: ['./whim.component.less']
})
export class WhimComponent implements OnInit {
  private authStatus: AuthStatus;
  private AuthStatus: any = AuthStatus;

  constructor(private accountService: AccountService) {
    this.resetLogin();
  }

  ngOnInit() {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    if (!this.accountService.userHasSession) {
      // If there's no session, prompt full sign-in/sign-up.
      this.authStatus = AuthStatus.LoginRequired;
    } else {
      // Else, ask for passcode if user hasn't authenticated recently.
      this.authStatus = AuthStatus.Unknown;
      const emailCookie = this.accountService.getEmailCookie();
      this.accountService.userIsAuthenticated.then((success: boolean) => {
        this.authStatus = success ? AuthStatus.Authenticated : AuthStatus.PasscodeRequired;
      });
    }
  }

  private resetLogin(): void {
    this.authStatus = AuthStatus.Unknown;
  }

  private authChange(newAuthStatus: AuthStatus): void {
    this.authStatus = newAuthStatus;
  }
}
