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

export interface IEvent {
  _id: string;
  userId: string;
  title: string;
  date: number;
  description: string;
}

export interface IName {
  first: string;
  last: string;
}

export interface IFriend extends IName {
  _id: string;
  userId: string;
  notes: string;
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
  AddFriends = 'AddFriends',
  AddEvents = 'AddEvents',
  Calendar = 'Calendar'
}

/***** MESSAGING INTERFACES *****/
export enum WhimAPI {
  GetIdeasForDate = '/ideas',
  Login = '/login',
  Signup = '/signup',
  GetUser = '/user',
  AddFriends = '/friends',
  GetAllFriends = '/friends',
  GetAvailableFriends = '/friends/available',
  GetFriend = '/user/friend',
  GetEvents = '/events',
  AddEvents = '/events'
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
  notes: string;
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

export interface IGetEventsParams {
  userId: string;
  includeArchived: boolean;
}

export interface IAddEventArguments {
  title: string;
  description: string;
  date: number;
}

export interface IAddEventsArguments {
  userId: string;
  events: IAddEventArguments[];
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
  InsufficientFriends = 'Whim.InsufficientFriends',
  NoEvents = 'Whim.NoEventsForUser',
  UnableToParseDate = 'Whim.UnableToParseDate'
}

