// tslint:disable:no-empty-interface
import { IParsedDate } from './date';
import { IUser, WindowView } from './models';

export enum WhimAPI {
  GetIdeasForDate = '/ideas',
  Login = '/login',
  Signup = '/signup',
  GetUser = '/user',
  AddFriends = '/friends',
  GetAllFriends = '/friends',
  UpdateFriends = '/friends',
  GetAvailableFriends = '/friends/available',
  GetFriend = '/friend',
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
  birthday?: string;
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

export interface IGetEventsParams {
  userId: string;
  includeArchived: boolean;
}

export interface IAddEventArguments {
  title: string;
  description: string;
  date: IParsedDate;
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

  constructor(
    public errorMessage: WhimErrorMessage,
    public httpCode: number = 200) {}
}

export enum WhimErrorCode {
  InsufficientFriends = 'Whim.InsufficientFriends',
  NoEvents = 'Whim.NoEventsForUser',
  UnableToParseDate = 'Whim.UnableToParseDate'
}

