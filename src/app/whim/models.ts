// tslint:disable:no-empty-interface
export type Guid = string;

export interface IIdeaSelection {
  _id: Guid;
  date: Date;
  idea: IIdea;
}

export interface IIdea {
  _id: Guid;
  person: IFriend;
  method: IMethod;
  userId: string;
}

export interface IEvent {
  _id: Guid;
  userId: string;
  title: string;
  nextDate: IEventDate;
  description?: string;
  relatedFriends: string[];
  tags: string[];
  whenAdded: Date;
  whenLastModified: Date;
}

export interface IEventDate {
  recurrent: boolean;
  baseDate: number;
  recurrenceOffset?: 'day' | 'week' | 'month';
}


export interface IName {
  first: string;
  last: string;
}

export interface IFriend extends IName {
  _id: Guid;
  userId: string;
  birthday?: Date;
  email?: string;
  phone?: string;
  location: ICity;
  tags: string[];
  methods: IMethod[];
  organization?: string;
  skills?: string[];
  notes?: string;
  whenAdded: Date;
  whenLastModified: Date;
}

export interface ICity {
  city: string;
  state?: string;
  country?: string;
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

export interface IUser extends IName {
  _id: Guid;
  email: string;
  location: ICity;
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
  ShowFriend = 'ShowFriend',
  ShowEvent = 'ShowEvent',
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
  AddEvents = '/events',
  ParseSearch = '/parse'
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

export interface ILoginArguments {
  email: string;
  passcode: string;
}

export interface ILoginResponse extends IUser { }

export interface ISignupArguments extends ILoginArguments {
  first: string;
  last: string;
  location: ICity;
}

export interface ISignupResponse extends IUser { }

export interface IGetUserParams {
  _id?: string;
  email?: string;
}

export interface IGetUserResponse extends IUser { }

export interface IAddFriendArguments {
  first: string;
  last: string;
  birthday?: Date;
  email?: string;
  phone?: string;
  location: ICity;
  tags: string[];
  methods: IMethod[];
  organization?: string;
  skills?: string[];
  notes?: string;
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

export interface IParseSearchArguments {
  userId: string;
  searchTerm: string;
}

export interface IParseResult {
  header: string;
  description: string;
  leadsTo: WindowView;
  arguments: any;
}

export interface IParseSearchResults {
  results: IParseResult[];
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

