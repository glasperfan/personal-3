import {
    IGetUserParams,
    ILoginArguments,
    ISignupArguments,
    IUser,
    IUserSettings,
    IUserWithPasscode,
    WhimAPI,
    WhimError,
} from '../models';
import { DatabaseManager } from '../managers';
import * as MongoDB from 'mongodb';
import { v4 } from 'uuid';

export class UserManager {

  private readonly dbMgr: DatabaseManager;
  private readonly collectionToken = 'users';

  constructor(dbMgr: DatabaseManager) {
    this.dbMgr = dbMgr;
  }

  public createUser(args: ISignupArguments): Promise<IUser> {
    const newUser: IUserWithPasscode = {
      _id: v4(),
      name: {
        first: args.first,
        last: args.last,
        displayName: `${args.first} ${args.last}`,
      },
      email: args.email,
      location: { city: args.city },
      passcode: args.passcode,
      settings: this._defaultUserSettings
    };

    // Validate
    try {
      this.validateName(args.first, args.last);
      this.validateEmail(args.email);
      this.validatePasscode(args.passcode);
    } catch (e) {
      return Promise.reject(e);
    }
    return this.hasUserForEmail(args.email).then(userExists => {
      if (userExists) {
        throw new WhimError(`There is already a user with the email ${args.email}`);
      } else {
        return this.getUsersCollection().insertOne(newUser).then(write => {
          if (!!write.result.ok) {
            return this.removePasscode(newUser);
          }
          throw new WhimError(`Unable to create user ${args.first} ${args.last}`);
        });
      }
    });
  }

  public authenticateUser(args: ILoginArguments): Promise<IUser> {
    return this.getUserWithPasscodeByEmail(args.email).then((user: IUserWithPasscode) => {
      if (user && args.passcode === String(user.passcode)) {
        return this.removePasscode(user);
      }
      throw new WhimError('Unable to authenticate.');
    });
  }

  public getUser(_userId: string): Promise<IUser> {
    return this.getUserWithPasscode(_userId)
      .then(user => Promise.resolve(this.removePasscode(user)));
  }

  public getUserWithPasscode(_userId: string): Promise<IUserWithPasscode> {
    return this.getUsersCollection().findOne(_userId).then(user => {
      if (!user) {
        throw new WhimError('Unable to find user by id.');
      }
      return Promise.resolve(user);
    });
  }

  public getUserByEmail(email: string): Promise<IUser> {
    return this.getUserWithPasscodeByEmail(email)
      .then(user => Promise.resolve(this.removePasscode(user)));
  }

  public hasUserForEmail(email: string): Promise<boolean> {
    return this.getUsersCollection().findOne({ email: email }).then(user => Promise.resolve(!!user));
  }

  public getUserWithPasscodeByEmail(email: string): Promise<IUserWithPasscode> {
    return this.getUsersCollection().findOne({ email: email }).then(user => {
      if (!user) {
        throw new WhimError(`Unable to find a user with the email ${email}.`);
      }
      return Promise.resolve(user);
    });
  }

  public getAllUsers(): Promise<IUser[]> {
    return this.getUsersCollection().find().toArray();
  }

  public getCollectionToken(): string {
    return this.collectionToken;
  }

  public getUsersCollection(): MongoDB.Collection<IUserWithPasscode> {
    return this.dbMgr.getOrCreateCollection<IUserWithPasscode>(this.getCollectionToken());
  }

  public removePasscode(user: IUserWithPasscode): IUser {
    delete user.passcode;
    return user as IUser;
  }

  private validateName(firstName: string, lastName: string): void {
    if (!firstName || !lastName) {
      throw new WhimError('First name and last name cannot be empty.');
    }
    if (firstName.trim().length === 0 || lastName.trim().length === 0) {
      throw new WhimError('First name and last name cannot be just spaces.');
    };
  }

  private validateEmail(email: string): void {
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      throw new WhimError('Email does not have a recognizable format.');
    }
  }

  private validatePasscode(passcode: string): void {
    if (isNaN(Number(passcode))) {
      throw new WhimError('Passcode must be numeric.');
    }
    if (!passcode) {
      throw new WhimError('Passcode cannot be empty');
    }
    if (passcode.length !== 4) {
      throw new WhimError('Passcode must be 4 digits.');
    }
  }

  private get _defaultUserSettings(): IUserSettings {
    return {
      email: {
        weeklyOptIn: false
      }
    };
  }
}
