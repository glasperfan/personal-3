// tslint:disable:no-empty-interface
export interface IIdeaSelection {
  _id: string;
  date: Date;
  idea: IIdea;
}

export interface IIdea {
  _id: string;
  person: IFriend;
  method: IMethod;
  userId: string;
}

export interface IFriend {
  _id: string;
  first: string;
  last: string;
  userId: string;
  wasRemoved: boolean;
}

export interface IMethod {
  methodCode: MethodCode;
  message: string;
}

export enum MethodCode {
  Email,
  Call,
  Text,
  VideoChat,
  Hangout,
  Meal,
  Gift,
  CarePackage,
  Letter
}

export interface IUser {
  _id: string;
  first: string;
  last: string;
  email: string;
}

export interface IUserWithPasscode extends IUser {
  passcode: string;
}

/***** ROUTING *****/
export enum WindowView {
  None = 'None', // display nothing
  Login = 'Login',
  Signup = 'Signup',
  Passcode = 'Passcode',
  Dashboard = 'Dashboard',
  AddUsers = 'AddUsers',
  AddEvents = 'AddEvents',
  Calendar = 'Calendar'
}

/***** MESSAGING INTERFACES *****/
export enum WhimAPI {
  GetIdeasForDate = '/ideas',
  Login = '/login',
  Logout = '/logout',
  Signup = '/signup',
  GetUser = '/user',
  AddFriends = '/user/friend/add',
  GetAllFriends = '/user/friend/all',
  GetAvailableFriends = '/user/friend/available',
  GetFriend = '/user/friend'
}

export interface IResponse {
  error: IError;
}

export interface IError {
  errorMessage: string;
  httpCode: number;
}

export interface IGetIdeasForDateParams {
  userId: string;
  timestamp: number;
}

export interface ILoginArguments extends IPasscodeArguments {
  email: string;
}

export interface ILoginResponse extends IUser { }

export interface ISignupArguments extends IPasscodeArguments {
  first: string;
  last: string;
  email: string;
}

export interface ISignupResponse extends IUser { }

export interface IPasscodeArguments {
  passcode: string;
}

export interface IGetUserParams {
  _id?: string;
  email?: string;
}

export interface IGetUserResponse extends IUser { }

export interface IAddFriendArguments {
  first: string;
  last: string;
}

export interface IAddFriendsArguments {
  userId: string;
  friends: IAddFriendArguments[];
}

export interface IGetAllFriendsArguments {
  userId: string;
}

export interface IGetAvailableFriendsArguments {
  userId: string;
}

export interface IGetFriendArguments {
  userId: string;
  friendId: string;
}


/***** MESSAGING INTERFACES *****/
export type WhimErrorMessage = string | WhimErrorCode;
export class WhimError implements IError {

  public readonly errorMessage: WhimErrorMessage;
  public readonly httpCode: number;

  constructor(message: WhimErrorMessage, code: number = 200) {
    this.errorMessage = message;
    this.httpCode = code;
  }
}

export enum WhimErrorCode {
  InsufficientFriends = 'Whim.InsufficientFriends'
}

