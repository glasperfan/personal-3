import { IFriendManager } from '../managers/contracts/IFriendManager';
import { WhimError, WhimErrorCode, IIdea, IIdeaSelection, IFriend } from '../models';
import {
  DatabaseManager,
  HistoryManager,
  FriendManager,
  MethodManager
} from '../managers';
import { IMethodGenerator } from './MethodGenerator';
import { v4 } from 'uuid';

// Takes a user, their methods, their history, and their friend list, and spits out ideas.
export class IdeaGenerator {

  constructor(
    private friendMgr: IFriendManager,
    private methodMgr: MethodManager,
    private historyMgr: HistoryManager) {}

  public getIdeasForToday(userId: string): Promise<IIdeaSelection[]> {
    return this.getIdeasForDate(userId, new Date());
  }

  public getIdeasForDate(userId: string, date: Date, ideaCount: number = 4): Promise<IIdeaSelection[]> {
    return this.historyMgr.getHistoryForDate(date).then((archivedIdeas: IIdeaSelection[]) => {
      if (archivedIdeas && archivedIdeas.length === ideaCount) {
        return Promise.resolve(archivedIdeas);
      }
      return this.friendMgr.getAllFriends(userId).then((friends: IFriend[]) => {
        if (friends.length < ideaCount) {
          throw new WhimError(WhimErrorCode.InsufficientFriends);
        }
        const ideas: IIdeaSelection[] = new Array(ideaCount);
        const methods = MethodManager.DefaultFormatGenerators;
        for (let i = 0; i < ideaCount; i++) {
          ideas[i] = this.generateIdea(userId, friends, methods);
        }
        return Promise.resolve(ideas);
      });
    });
  }

  private generateIdea(userId: string, friends: IFriend[], methods: IMethodGenerator[]): IIdeaSelection {
    // For now, we assume no preference for how to communicate with a friend. Later,
    // users should be able to customize the methods of communication (i.e. avoid ideas of having
    // a meal with a friend who lives far away).
    const randomFriend: IFriend = this.randomSelectWithoutReplacement(friends);
    const randomMethod: IMethodGenerator = this.randomSelectWithoutReplacement(methods);
    const randomIdea: IIdea = {
      _id: v4(),
      person: randomFriend,
      method: { methodCode: randomMethod.code, message: randomMethod.formatMessage(randomFriend) },
      userId: userId
    };
    return this.createNewIdeaSelection(randomIdea);
  }

  private createNewIdeaSelection(idea: IIdea): IIdeaSelection {
    return {
      _id: v4(),
      date: new Date(),
      idea: idea
    };
  }

  private randomSelectWithoutReplacement<T>(arr: T[]): T {
    const i = Math.floor(Math.random() * arr.length);
    return arr.splice(i, 1)[0];
  }

};
