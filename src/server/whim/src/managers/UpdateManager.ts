import { IUser } from '../models';
import { IAddEventArguments } from '../models/api';
import { IFriendManager } from './contracts/IFriendManager';
import { ICalendarManager } from './contracts/ICalendarManager';
import { UserManager } from './';

export class UpdateManager {

  private readonly UPDATES: { [id: string]: () => Promise<void> } = {
    'addMissingBirthdayEvents': this.addBirthdayEvents
  };

  constructor(
    private userMgr: UserManager,
    private calendarMgr: ICalendarManager,
    private friendMgr: IFriendManager) { }

  performAllUpdates(): Promise<void> {
    return Promise.all([
      this.addBirthdayEvents()
    ]).then(_ => console.log('Ran all updates...'));
  }

  private addBirthdayEvents(): Promise<void> {
    let allUsers: IUser[];
    const usersFriends = this.userMgr.getAllUsers().then(users => {
      allUsers = users;
      return users;
    }).then(users => Promise.all(users.map(user => this.friendMgr.getAllFriends(user._id))));

    return usersFriends.then(setsOfFriends => Promise.all(
      setsOfFriends.map((friends, idx) => {
        return this.friendMgr.createBirthdays(allUsers[idx]._id, friends).then(_ => undefined);
      })
    )).then(_ => undefined).catch(e => console.log(e));
  }
}
