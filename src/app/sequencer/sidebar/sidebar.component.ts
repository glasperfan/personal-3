import { Component } from '@angular/core';

export type Tabs = 'sounds';

@Component({
  selector: 'p3-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class SidebarComponent {

  private selectedTab: Tabs;

  constructor() {
    this.selectedTab = 'sounds';
  }
}
