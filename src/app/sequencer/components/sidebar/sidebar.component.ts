import { Component } from '@angular/core';

export type NavSelectionName = 'Library' | 'Settings' | 'Download';

export interface NavSelection {
  name: NavSelectionName;
  icon: string;
  iconDesc: string;
}


@Component({
  selector: 'p3-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class SidebarComponent {

  public navSelections: NavSelection[];
  public navSelection: NavSelection;

  constructor() {
    this.navSelections = [
      { name: 'Library', icon: '/assets/library.png', iconDesc: 'Library' },
      { name: 'Download', icon: '/assets/download.png', iconDesc: 'Download' },
      { name: 'Settings', icon: '/assets/settings.png', iconDesc: 'Settings' }
    ];
    this.navSelection = this.navSelections[0];
  }

  view(selection: NavSelection) {
    this.navSelection = selection;
  }
}
