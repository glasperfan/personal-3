import { ILink } from 'app/interfaces/ILink';

export interface ILocals {
  About: {
    Name: string;
    Year: number;
    Copyright: (name, year) => string;
  };
  Nav: {
    Title: string;
  };
  Links: {
    Title: ILink;
    About: ILink;
    Work: ILink;
    Content: ILink;
    Sequencer: ILink;
  };
}

export const Locals: ILocals = {
  About: {
    Name: 'Hugh Zabriskie',
    Year: 2017,
    Copyright: (name, year) => `Copyright &copy; ${year} ${name}`
  },
  Nav: {
    Title: 'Hugh Zabriskie, eng/music'
  },
  Links: {
    Title: { name: 'Home', route: '/#' },
    About: { name: 'About', route: '/#about' },
    Work: { name: 'Work', route: '/#work' },
    Content: { name: 'Content', route: '/#content' },
    Sequencer: { name: 'Sequencer', route: '/sequencer' }
  }
};
