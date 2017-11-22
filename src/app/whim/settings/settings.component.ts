import { ShowComponent } from '../show/show.component';
import { CRON_SCHEDULES, ICronSchedule, IUserSettings, WhimError, WindowView, WindowViewWithArgs } from '../models';
import { SettingsService } from '../services/settings.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { get, set } from 'lodash';

@Component({
  selector: 'p3-whim-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
  providers: [SettingsService]
})
export class SettingsComponent extends ShowComponent<IUserSettings> implements OnInit {
  private settingsAltered = false;

  constructor(private settingsService: SettingsService) { super(); }

  ngOnInit() {
    this.settingsService.currentUserSettings$
      .then(s => {
        if (!s) {
          throw new WhimError('Empty settings for user.');
        }
        this.args = s;
        this.settingsAltered = false;
      })
      .catch(err => {
        this.processMessage = 'Unable to retrieve your settings... contact Hugh :/';
        console.log(err);
      });
  }

  protected update(): void {
    const op = this.settingsAltered ? this.settingsService.updateSettings(this.args) : Promise.resolve();
    op.then(_ => {
      this.editMode = false;
      this.settingsAltered = false;
    }).catch(err => {
        this.processMessage = `Unable to update your settings... contact Hugh :/`;
        console.log(err);
      });
  }

  protected delete(): void {
    throw new Error('Not implemented for settings.');
  }

  private get _weeklyOptIn(): boolean {
    return get(this.args, 'email.weeklyOptIn');
  }

  private set _weeklyOptIn(b: boolean) {
    if (b !== this._weeklyOptIn) {
      set(this.args, 'email.weeklyOptIn', b);
      this.settingsAltered = true;
    }
  }

  private get _weeklySchedule(): ICronSchedule {
    const schedule: ICronSchedule = get(this.args, 'email.weeklySchedule');
    return !!schedule._id ? schedule : CRON_SCHEDULES[0];
  }

  private set _weeklySchedule(cs: ICronSchedule) {
    if (cs !== this._weeklySchedule) {
      set(this.args, 'email.weeklySchedule', cs);
      this.settingsAltered = true;
    }
  }
}
