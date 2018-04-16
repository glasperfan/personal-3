import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { IPlaylist, ISession, Session } from '../models';

@Injectable()
export class PlaylistService {

  public currentSession$: Observable<ISession>;
  public newSessionCreated$: Observable<ISession>;
  public currentPlaylist$: Observable<IPlaylist>;
  public toggleDashboard = true;
  
  private _newSessionCreated$: BehaviorSubject<ISession>;
  private _currentPlaylist$: BehaviorSubject<IPlaylist>;
  
  constructor() {
    this._newSessionCreated$ = new BehaviorSubject<ISession>(undefined);
    this._currentPlaylist$ = new BehaviorSubject<IPlaylist>(this.emptyPlaylist);
    this.newSessionCreated$ = this._newSessionCreated$.skip(1);
    this.currentPlaylist$ = this._currentPlaylist$.asObservable();
    this.currentSession$ = this.currentPlaylist$.map(p => p.sessions && p.sessions.length ? p.sessions[0] : undefined);
  }

  private get emptyPlaylist(): IPlaylist {
    return { sessions: [] };
  }

  public get currentSession(): ISession {
    const pl = this._currentPlaylist$.value;
    return pl && pl.sessions && pl.sessions.length && pl.sessions[0];
  }
  
  public addSession(sessionName: string): void {
    const currentPlaylist = this._currentPlaylist$.value;
    const newSession = new Session(sessionName || 'Untitled');
    currentPlaylist.sessions.push(newSession);
    this._newSessionCreated$.next(newSession);
    this._currentPlaylist$.next(currentPlaylist);
  }

  public deleteCurrentSession(): void {
    this.deleteSession(0);
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
