export interface IRole {
  organization: string;
  position: string;
  dates: string;
  location: string;
  link: string;
}

export interface ISection {
    header: string;
    elementId: string;
    content: string[];
}

export interface ILink {
  name: string;
  route: string;
  tag?: string;
}