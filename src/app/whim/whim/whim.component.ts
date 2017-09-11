import { WindowManager } from '../services/window.manager';
import { AccountService } from '../services/account.service';
import { Component, OnInit } from '@angular/core';
import { WindowView, WindowViewWithArgs } from '../models';

@Component({
  selector: 'p3-whim',
  templateUrl: './whim.component.html',
  styleUrls: ['./whim.component.less'],
  providers: [WindowManager]
})
export class WhimComponent implements OnInit {
  private WindowView = WindowView;
  private viewArgs: any;

  constructor(private accountService: AccountService, private windowManager: WindowManager) {
    this.clearView();
  }

  ngOnInit() {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    if (!this.accountService.userHasSession) {
      // If there's no session, prompt full sign-in/sign-up.
      this.windowManager.switchTo(new WindowViewWithArgs(WindowView.Login));
    } else {
      // Else, ask for passcode if user hasn't authenticated recently.
      this.clearView();
      const emailCookie = this.accountService.getEmailCookie();
      this.accountService.userIsAuthenticated.then((success: boolean) => {
        this.windowManager.switchTo(new WindowViewWithArgs(
          success ? WindowView.Dashboard : WindowView.Passcode));
      });
    }
  }

  private clearView(): void {
    this.switchTo(new WindowViewWithArgs(WindowView.None));
  }

  private switchTo(view: WindowViewWithArgs): void {
    this.windowManager.switchTo(view);
    this.viewArgs = view.args;
  }

  private logout(): void {
    this.accountService.logout();
    this.windowManager.switchTo(new WindowViewWithArgs(WindowView.Login));
  }
}
