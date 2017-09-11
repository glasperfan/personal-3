import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { AccountService } from './account.service';
import { WindowView, WindowViewWithArgs } from '../models';

@Injectable()
export class WindowManager {
  private _currentView$: BehaviorSubject<WindowViewWithArgs>;

  constructor(private accountService: AccountService) {
    this._currentView$ = new BehaviorSubject<WindowViewWithArgs>(new WindowViewWithArgs(WindowView.None));
  }

  public get currentView$(): Observable<WindowViewWithArgs> {
    return this._currentView$.asObservable();
  }

  public get currentWindow$(): Observable<WindowView> {
    return this._currentView$.asObservable().map(v => v.window);
  }

  public switchTo(view: WindowViewWithArgs): void {
    let requiresAuthentication: boolean;
    switch (view.window) {
      case WindowView.Login:
      case WindowView.Signup:
      case WindowView.Passcode:
      case WindowView.None:
        requiresAuthentication = false;
        break;
      default:
        requiresAuthentication = true;
        break;
    }
    this.accountService.currentUserIsAuthenticated$.then(isAuthenticated => {
      if (requiresAuthentication && !isAuthenticated) {
        // redirect to login
        // TODO pass through user email if available
        return Promise.resolve(new WindowViewWithArgs(WindowView.Login));
      }
      return Promise.resolve(view);
    }).then((viewToDisplay: WindowViewWithArgs) => {
      console.log(`WindowManager: switching to ${viewToDisplay.window} with arguments ${JSON.stringify(viewToDisplay.args)}`);
      this._currentView$.next(viewToDisplay);
    });
  }
}
