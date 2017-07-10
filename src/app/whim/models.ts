export interface IIdeaSelection {
  id: string;
  date: Date;
  idea: IIdea;
}

export interface IIdea {
  id: string;
  person: IFriend;
  method: IMethod;
  user: IUser;
}

export interface IFriend {
  id: string;
  first: string;
  last: string;
  userId: string;
  wasRemoved: boolean;
}

export interface IMethod {
  name: string;
}

export interface IUser {
  id: string;
}
