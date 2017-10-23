import { IParsedDate } from './date';
import * as moment from 'moment';

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
  date: IParsedDate;
  description?: string;
  relatedFriends: string[];
  tags: string[];
  whenAdded: number;
  whenLastModified: number;
}

export interface IName {
  first: string;
  last: string;
  displayName: string;
}

export interface INote {
  text: string;
  dateCreated: number;
  dateModified: number;
}

export class Note implements INote {
  constructor(
    public text: string = '',
    public dateCreated: number = Date.now(),
    public dateModified: number = Date.now()
  ) { }
}

export interface IFriend {
  _id: Guid;
  userId: string;
  name: IName;
  birthday?: number;
  email?: string;
  phone?: string;
  address: IAddress;
  tags: string[];
  methods: IMethod[];
  organization?: string;
  skills?: string[];
  notes?: INote[];
  whenAdded: number;
  whenLastModified: number;
}

export interface IAddress {
  address1?: string;
  address2?: string;
  city?: string;
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

export interface IUser {
  _id: Guid;
  name: IName;
  email: string;
  location: IAddress;
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
  ShowFriends = 'ShowFriends',
  ShowEvents = 'ShowEvents',
  Calendar = 'Calendar'
}

export interface IWindowViewWithArgs {
  window: WindowView;
  args: any;
}

export class WindowViewWithArgs implements IWindowViewWithArgs {
  constructor(public window: WindowView, public args: any = undefined) { }
}
