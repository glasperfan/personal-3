import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { IPlaylist, ISession, Session } from '../models';

@Injectable()
export class PlaylistService {

  public currentSession$: Observable<ISession>;
  public currentPlaylist$: Observable<IPlaylist>;
  public toggleDashboard = false;
  
  private _currentPlaylist$: BehaviorSubject<IPlaylist>;
  
  constructor() {
    this._currentPlaylist$ = new BehaviorSubject<IPlaylist>(this.templatePlaylist);
    this.currentPlaylist$ = this._currentPlaylist$.asObservable();
    this.currentSession$ = this.currentPlaylist$.map(p => p.sessions && p.sessions.length ? p.sessions[0] : undefined);
  }

  private get templatePlaylist(): IPlaylist {
    return {
      sessions: [
        new Session('Respond to emails'),
        new Session('Look into flights for trip in May'),
        new Session('Write down notes before meeting at 11')
      ]
    };
  }

  public get currentSession(): ISession {
    const pl = this._currentPlaylist$.value;
    return pl && pl.sessions && pl.sessions.length && pl.sessions[0];
  }

  public addSession(sessionName: string): void {
    const currentPlaylist = this._currentPlaylist$.value;
    currentPlaylist.sessions.push(new Session(sessionName || 'Untitled'));
    this._currentPlaylist$.next(currentPlaylist);
  }

  public deleteSession(sessionIdx: number): void {
    const currentPlaylist = this._currentPlaylist$.value;
    currentPlaylist.sessions.splice(sessionIdx, 1);
    this._currentPlaylist$.next(currentPlaylist);
  }

  public get TotalQueuedSessions(): number {
    return this._currentPlaylist$.value.sessions.length;
  }

}
