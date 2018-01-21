import { Component } from '@angular/core';
import { PlaylistService } from '../services';

@Component({
  selector: 'p3-mela-main',
  templateUrl: 'main.component.html',
  styleUrls: ['main.component.less']
})
export class MainComponent {
  constructor(public playlistSvc: PlaylistService) { }
}
