import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { PlaylistService } from '../services/playlist.service';
import { ISession, IMood } from '../models';

@Component({
  selector: 'p3-mela-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

  public currentSessions$: Observable<ISession[]>;
  public selectedMood: IMood;

  constructor(public playlistSvc: PlaylistService) { }

  ngOnInit() {
    this.currentSessions$ = this.playlistSvc.currentPlaylist$.map(p => p.sessions);
  }

  get availableMoods() {
    return this.playlistSvc.availableMoods$;
  }
}
