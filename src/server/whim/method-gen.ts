import { IFriend, MethodCode } from './models';

export interface IMethodGenerator {
  code: MethodCode;
  friendArgCount: number;
  formatMessage(...friends: IFriend[]): string;
}

abstract class BaseMethodGenerator implements IMethodGenerator {
  public readonly friendArgCount: number;
  public readonly code: MethodCode;
  protected readonly formatString: string;

  constructor(code: MethodCode, argCount: number = 0, formatString: string = '') {
    this.code = code;
    this.friendArgCount = argCount;
    this.formatString = formatString;
  }

  formatMessage(...friends: IFriend[]): string {
    if (this.friendArgCount === 0) {
      return this.formatString;
    } else if (this.friendArgCount === 1) {
      return this.formatString.replace('{}',  this.displayName(friends[0]));
    } else {
      let formattedMsg = this.formatString;
      for (let i = 0; i < this.friendArgCount; i++) {
        formattedMsg = formattedMsg.replace(`{${i}}`, this.displayName(friends[i]));
      }
      return formattedMsg;
    }
  }

  displayName(friend: IFriend): string {
    return `${friend.first} ${friend.last}`;
  }
}


export class EmailMethodGenerator extends BaseMethodGenerator {
  constructor() { super(MethodCode.Email, 1, 'Send an email to {}.'); }
}

export class CallMethodGenerator extends BaseMethodGenerator {
  constructor() { super(MethodCode.Call, 1, 'Take a few minutes to call {}.'); }
}

export class TextMethodGenerator extends BaseMethodGenerator {
  constructor() { super(MethodCode.Text, 1, 'Text {} to check in.'); }
}

export class VideoChatMethodGenerator extends BaseMethodGenerator {
  constructor() {
    super(MethodCode.VideoChat, 1, 'Use FaceTime, Skype, or Google Hangouts to connect with {}.');
  }
}

export class LetterMethodGenerator extends BaseMethodGenerator {
  constructor() { super(MethodCode.Letter, 1, 'Go old school and write a letter to {}.'); }
}

export class CarePackageMethodGenerator extends BaseMethodGenerator {
  constructor() { super(MethodCode.CarePackage, 1, `Assemble a care package for {} - without Amazon's help.`); }
}

export class MealMethodGenerator extends BaseMethodGenerator {
  constructor() { super(MethodCode.Meal, 1, 'Find time to meet {} for coffee, lunch, or dinner.'); }
}
