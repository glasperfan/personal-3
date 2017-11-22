import { Injectable } from '@angular/core';
import { CRON_SCHEDULES, Guid, ICronSchedule, IUpdateSettingsArguments, IUser, IUserSettings, WhimAPI } from '../models';
import { AccountService } from './account.service';
import { HttpService } from './http.service';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class SettingsService {
  public currentUserSettings$: Promise<IUserSettings>;

  public emailSchedules: ICronSchedule[] = CRON_SCHEDULES;
  public emailScheduleTitles: string[] = this.emailSchedules.map(s => s.name);

  constructor(private http: HttpService, private accountService: AccountService) {
    this.currentUserSettings$ = this.accountService.currentUser$.then(currentUser =>
      this.getSettings(currentUser._id)
    );
  }

  public getSettings(userId: Guid): Promise<IUserSettings> {
    return this.http.get(WhimAPI.GetSettings, { userId: userId });
  }

  public updateSettings(settings: IUserSettings): Promise<void> {
    return this.accountService.currentUser$.then(currentUser => {
      const payload: IUpdateSettingsArguments = { userId: currentUser._id, settings: settings };
      return this.http.putOrThrow<IUpdateSettingsArguments>(WhimAPI.UpdateSettings, payload);
    });
  }
}
