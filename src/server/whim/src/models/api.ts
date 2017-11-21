// tslint:disable:no-empty-interface
import { IUser, WindowView, Guid, IUserSettings, IParsedDate } from './';

export enum WhimAPI {
  GetIdeasForDate = '/ideas',
  Login = '/login',
  Signup = '/signup',
  GetUser = '/user',
  AddFriends = '/friends',
  GetAllFriends = '/friends',
  UpdateFriends = '/friends',
  DeleteFriends = '/friends/delete',
  GetFriend = '/friend',
  GetEvents = '/events',
  AddEvents = '/events',
  UpdateEvents = '/events',
  DeleteEvents = '/events/delete',
  ParseSearch = '/parse',
  UpdateSettings = '/settings'
}

export interface IResponse {
  error: IError;
}

export interface IError {
  errorMessage: string;
  httpCode: number;
}

export interface IField {
  field: string;
  value: any;
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
  city?: string;
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
  email?: string;
  phone?: string;
  birthday?: number;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  organization?: string;
  tags?: string[];
  firstNote?: string;
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

export interface IDeleteFriendsArguments {
  userId: string;
  friendIds: Guid[];
}

export interface IGetEventsParams {
  userId: string;
  includeArchived: boolean;
}

export interface IAddEventArguments {
  title: string;
  description: string;
  date: IParsedDate;
  tags: string[];
}

export interface IAddEventsArguments {
  userId: string;
  events: IAddEventArguments[];
}

export interface IDeleteEventsArguments {
  userId: string;
  events: Guid[];
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

export interface IUpdateSettingsArguments {
  userId: string;
  settings: IUserSettings;
}


/***** MESSAGING INTERFACES *****/
export type WhimErrorMessage = string | WhimErrorCode;
export class WhimError implements IError {

  constructor(
    public errorMessage: WhimErrorMessage,
    public httpCode: number = 200) {}
}

export enum WhimErrorCode {
  InsufficientFriends = 'Whim.InsufficientFriends',
  NoEvents = 'Whim.NoEventsForUser',
  UnableToParseDate = 'Whim.UnableToParseDate'
}

