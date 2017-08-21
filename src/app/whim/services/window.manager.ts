import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { AccountService } from './account.service';
import { WindowView } from '../models';

@Injectable()
export class WindowManager {
  private _currentView$: BehaviorSubject<WindowView>;

  constructor(private accountService: AccountService) {
    this._currentView$ = new BehaviorSubject<WindowView>(WindowView.None);
  }

  public get currentView$(): Observable<WindowView> {
    return this._currentView$.asObservable();
  }

  public switchTo(view: WindowView): void {
    let requiresAuthentication: boolean;
    switch (view) {
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
        return Promise.resolve(WindowView.Login);
      }
      return Promise.resolve(view);
    }).then((viewToDisplay: WindowView) => {
      console.log(`WindowManager: switching to ${viewToDisplay}`);
      this._currentView$.next(viewToDisplay);
    });
  }
}
