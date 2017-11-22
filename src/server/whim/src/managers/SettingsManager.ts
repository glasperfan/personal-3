import { UserManager } from './UserManager';
import { IUserSettings, WhimError } from '../models';
export class SettingsManager {

  public readonly DefaultSettings: IUserSettings = {
    email: {
      weeklyOptIn: false,
      weeklySchedule: undefined
    }
  };

  constructor(private userMgr: UserManager) {}

  public getUserSettings(userId: string): Promise<IUserSettings> {
    return this.userMgr.getUsersCollection()
      .findOne({ _id: userId })
      .then(user => {
        return Promise.resolve(user.settings || this.DefaultSettings);
      })
      .catch(err => {
        throw new WhimError(`Failed to get user settings (id: ${userId}) with error: ${err}.`);
      });
  }

  public updateUserSettings(userId: string, settings: IUserSettings): Promise<void> {
    return this.userMgr.getUsersCollection().updateOne(
      { _id: userId },
      { $set: { settings: settings } }
    ).then(result => {
      if (result.matchedCount === 1 && result.result.ok) {
        return Promise.resolve();
      } else {
        throw new WhimError(`Failed to update user settings (id: ${userId}).`);
      }
    }).catch(err => Promise.reject(err));
  }
}
