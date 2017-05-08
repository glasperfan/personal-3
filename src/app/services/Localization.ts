import { ILink } from 'app/interfaces/ILink';
import { IRole } from 'app/interfaces/IRole';

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
    Contact: ILink;
    Sequencer: ILink;
  };
  Work: {
    Microsoft: IRole;
    Cringle: IRole;
    Cuthbert: IRole;
  };
}

export const Locals: ILocals = {
  About: {
    Name: 'Hugh Zabriskie',
    Year: 2017,
    Copyright: (name, year) => `Copyright &copy; ${year} ${name}`
  },
  Nav: {
    Title: 'Hugh Zabriskie'
  },
  Links: {
    Title: { name: 'Home', route: '/#' },
    About: { name: 'About', route: '/#about' },
    Work: { name: 'Work', route: '/#work' },
    Content: { name: 'Content', route: '/#content' },
    Contact: { name: 'Contact', route: '/#contact' },
    Sequencer: { name: 'Sequencer', route: '/sequencer' }
  },
  Work: {
    Microsoft: {
      organization: 'Microsoft',
      position: 'Software Engineer',
      dates: `Sep '16 -`,
      location: 'Redmond, WA',
      link: 'https://azure.microsoft.com/en-us/'
    },
    Cringle: {
      organization: 'Cringle GmbH',
      position: 'Software Engineering Intern',
      dates: `May '14 - Aug '14`,
      location: 'Berlin, Germany',
      link: 'https://cringle.net/en'
    },
    Cuthbert: {
      organization: 'CuthbertLab MIT',
      position: 'Researcher/Python Developer',
      dates: `Dec '14 - Jan '15`,
      location: 'Cambridge, MA',
      link: 'https://github.com/cuthbertLab/music21'
    },
  }
};
