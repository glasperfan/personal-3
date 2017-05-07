import { Component } from '@angular/core';
import { Locals } from 'app/services/Localization';
import { ILink } from 'app/interfaces/ILink';

@Component({
  selector: 'p3-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent {
  private title: ILink;
  private navTitle: string;
  private links: ILink[];

  constructor() {
    this.title = Locals.Links.Title;
    this.navTitle = Locals.Nav.Title;
    this.links = [
      Locals.Links.About,
      Locals.Links.Work,
      Locals.Links.Content
    ];
  }
}
