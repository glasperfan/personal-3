// tslint:disable:no-empty-interface
import { EventCategory, Guid, INote, IParsedDate, IUser, IUserSettings, WindowView } from './';

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
  GetSettings = '/settings',
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

export interface IByUser {
  userId: Guid;
}

export interface IGetIdeasForDateParams extends IByUser {
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
  notes?: INote[];
}

export interface IAddFriendsArguments extends IByUser {
  friends: IAddFriendArguments[];
}

export interface IGetAllFriendsArguments extends IByUser {}

export interface IGetAvailableFriendsArguments extends IByUser {}

export interface IGetFriendArguments extends IByUser {
  friendId: string;
}

export interface IDeleteFriendsArguments extends IByUser {
  friendIds: Guid[];
}

export interface IGetEventsParams extends IByUser {
  includeArchived: boolean;
}

export interface IAddEventArguments {
  title: string;
  description: string;
  date: IParsedDate;
  type: EventCategory;
  tags: string[];
  metadata?: {
    type?: EventCategory;
    birthdayFriend?: Guid;
  };
}

export interface IAddEventsArguments extends IByUser {
  events: IAddEventArguments[];
}

export interface IDeleteEventsArguments extends IByUser {
  events: Guid[];
}

export interface IParseSearchArguments extends IByUser {
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

export interface IGetSettingsArguments extends IByUser {}

export interface IUpdateSettingsArguments extends IByUser {
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

