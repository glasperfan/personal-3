import { ILink, IRole, ISection } from '../interfaces/Locals';

export interface ILocals {
  About: {
    Name: string;
    Copyright: (name: string, year: number) => string;
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
  };
  Work: {
    Microsoft: IRole;
    Cringle: IRole;
    Cuthbert: IRole;
  };
  Sections: {
    Home: ISection;
    About: ISection;
    Work: ISection;
    Content: ISection;
    Contact: ISection;
  };
}

export const Locals: ILocals = {
  About: {
    Name: 'Hugh Zabriskie',
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
    Contact: { name: 'Contact', route: '/#contact' }
  },
  Work: {
    Microsoft: {
      organization: 'Microsoft',
      position: 'Software Engineer',
      dates: `Sep '16 - March '18`,
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
  },
  Sections: {
    Home: {
      header: 'Home',
      elementId: 'home',
      content: [
        `I'm a software engineer, cyclist, and pianist that explores the union and intersection of these fields.
        By day, I work as a software engineer based in New York City, although I operate across a variety of industries, regions, and languages.
        By night, I train for triathlons and read about <a href="https://www.goodreads.com/quotes/807-the-place-to-improve-the-world-is-first-in-one-s"><i>Quality</i></a>.`,
        `I graduated from Harvard in 2016 with a joint concentration in Computer Science and Music.`,
        `If you would like to get in touch, please use the simple but robot-proof message system below.`
      ]
    },
    About: {
      header: 'About',
      elementId: 'about',
      content: [
        `I recently moved to the Northwest, and I keep busy with a million little projects.
        Statistically, there's a good chance one of them is a million-dollar project.
        You can see the results from some of them <a href="#work">below</a> and on
        <a href="https://github.com/glasperfan" target="_blank">GitHub</a>.`,
        `I'm participating in as many duathlons, triathlons, and long-distance cycling events
        as I can possibly fit in. My BMC Time Machine SLR02 is a natural extension of my being.
        You can check <a href="http://strava.com/athletes/zabriskie" target="_blank">Strava</a> to see what I'm up to.`,
        `I also spent 4 years at Harvard playing piano with the
        <a href="https://www.hastypudding.org/" target="_blank">Hasty Pudding Theatricals</a>,
        and I arranged and orchestrated starting as a sophmore. I continue to work as an orchestrator as an alumnus.`,
        `I'm always interested in freelance work, both as a versatile developer and as a pianist for almost any setting or occasion.`
      ]
    },
    Work: {
      header: 'Work',
      elementId: 'work',
      content: []
    },
    Content: {
      header: 'Content',
      elementId: 'content',
      content: [
        `<a href="http://mela.app.s3-website-us-west-2.amazonaws.com/">Mela</a> - a better Pomodoro`
      ],
    },
    Contact: {
      header: 'Contact',
      elementId: 'contact',
      content: [
        `Type <em>email</em> and follow the prompts.`
      ],
    }
  },
};
