import {
    CallMethodGenerator,
    CarePackageMethodGenerator,
    EmailMethodGenerator,
    IMethodGenerator,
    LetterMethodGenerator,
    MealMethodGenerator,
    TextMethodGenerator,
    VideoChatMethodGenerator,
} from './method-gen';
import { IFriend, IMethod, IUser, MethodCode } from './models';
import { DatabaseManager } from './database-mgr';

export class MethodManager {
  public static get DefaultFormatGenerators(): IMethodGenerator[] {
    return [
      new EmailMethodGenerator(),
      new TextMethodGenerator(),
      new CallMethodGenerator(),
      new VideoChatMethodGenerator(),
      new MealMethodGenerator(),
      new CarePackageMethodGenerator(),
      new LetterMethodGenerator()
    ];
  }
}
