import { Component } from '@angular/core';
import { Locals } from 'app/services/Localization';
import { ILink, IRole, ISection } from 'app/interfaces/Locals';

@Component({
  selector: 'p3-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent {
  private title: ILink;
  private navTitle: string;
  private links: ILink[];
  private roles: IRole[];
  
  private home: ISection;
  private about: ISection;
  private work: ISection;
  private content: ISection;
  private contact: ISection;

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
