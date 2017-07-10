import { IFriend, IIdeaSelection, IMethod, IUser, IIdea } from '../../app/whim/models';
import { DatabaseManager } from './database-mgr';
import { FriendManager } from './friend-mgr';
import { MethodManager } from './method-mgr';
import { v4 } from 'uuid';

// Takes a user, their methods, their history, and their friend list, and spits out ideas.
export class IdeaGenerator {

  private friendMgr: FriendManager;
  private methodMgr: MethodManager;

  constructor(friendMgr: FriendManager, methodMgr: MethodManager) {
    this.friendMgr = friendMgr;
    this.methodMgr = methodMgr;
  }

  public getIdeasForToday(user: IUser): Promise<IIdeaSelection[]> {
    return this.getIdeasForDate(user, new Date());
  }

  public getIdeasForDate(user: IUser, date: Date, ideaCount: number = 4): Promise<IIdeaSelection[]> {
    // TODO: check for existing ideas
    const getPossibleFriends = this.friendMgr.getAvailableFriends(user);
    const getPossibleMethods = this.methodMgr.getMethodsForUser(user);

    return Promise.all([
      getPossibleFriends,
      getPossibleMethods
    ]).then((result: [IFriend[], IMethod[]]) => {
      const friends = result[0];
      const methods = result[1];
      const ideas: IIdeaSelection[] = new Array(ideaCount);
      for (let i = 0; i < ideaCount; i++) {
        ideas[i] = this.generateIdea(user, friends, methods);
      }
      return Promise.resolve(ideas);
    });
  }

  private generateIdea(user: IUser, friends: IFriend[], methods: IMethod[]): IIdeaSelection {
    const randomFriend: IFriend = this.randomSelectFromArray(friends);
    const randomMethod: IMethod = this.randomSelectFromArray(methods);
    const randomIdea: IIdea = {
      id: v4(),
      person: randomFriend,
      method: randomMethod,
      user: user
    };
    return this.createNewIdeaSelection(randomIdea);
  }

  private createNewIdeaSelection(idea: IIdea): IIdeaSelection {
    return {
      id: v4(),
      date: new Date(),
      idea: idea
    };
  }

  private randomSelectFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

};