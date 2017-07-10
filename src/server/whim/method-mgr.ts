import { IMethod, IUser } from '../../app/whim/models';
import { DatabaseManager } from './database-mgr';

export class MethodManager {

  private readonly dbMgr: DatabaseManager;

  constructor(dbMgr: DatabaseManager) {
    this.dbMgr = dbMgr;
  }

  get defaultMethods(): IMethod[] {
    return [
      { name: 'send an email to' },
      { name: 'video chat with' },
      { name: 'send a care package to' },
      { name: 'send a quick message to' }
    ];
  }

  getMethodsForUser(user: IUser): Promise<IMethod[]> {
    return Promise.resolve(this.defaultMethods);
  }
}
