import { Component } from '@angular/core';
import { Locals } from '../../services/Localization';
import { ILink, IRole, ISection } from '../../interfaces/Locals';

@Component({
  selector: 'p3-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent {
  public title: ILink;
  public navTitle: string;
  public links: ILink[];
  public roles: IRole[];

  public home: ISection;
  public about: ISection;
  public work: ISection;
  public content: ISection;
  public contact: ISection;

  constructor() {
    this.title = Locals.Links.Title;
    this.navTitle = Locals.Nav.Title;

    this.links = [
      Locals.Links.About,
      Locals.Links.Work,
      Locals.Links.Content,
      Locals.Links.Contact
    ];

    this.roles = [
      Locals.Work.Microsoft,
      Locals.Work.Cuthbert,
      Locals.Work.Cringle
    ];

    this.home = Locals.Sections.Home;
    this.about = Locals.Sections.About;
    this.work = Locals.Sections.Work;
    this.content = Locals.Sections.Content;
    this.contact = Locals.Sections.Contact;
  }
}
