import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { IPlaylist, ISession, IMood, SessionType, Session } from '../models';

@Injectable()
export class PlaylistService {

  public currentSession$: Observable<ISession>;
  public currentPlaylist$: Observable<IPlaylist>;
  private _currentPlaylist$: BehaviorSubject<IPlaylist>;
  public availableMoods$: Observable<IMood[]>;
  private _availableMoods$: BehaviorSubject<IMood[]>;

  constructor() {
    this._currentPlaylist$ = new BehaviorSubject<IPlaylist>(this.templatePlaylist);
    this.currentPlaylist$ = this._currentPlaylist$.asObservable();
    this.currentSession$ = this.currentPlaylist$.map(p => p.sessions && p.sessions.length ? p.sessions[0] : undefined);
    this._availableMoods$ = new BehaviorSubject<IMood[]>(this.templateMoods);
    this.availableMoods$ = this._availableMoods$.asObservable();
  }

  get emptyPlaylist(): IPlaylist {
    return { sessions: [] };
  }

  get templatePlaylist(): IPlaylist {
    return {
      sessions: [
        {
          type: SessionType.Mela,
          mood: { displayName: 'Rage', key: 'rage' },
          icon: 'red-apple',
          totalDuration: Session.getDurationByType(SessionType.Mela)
        },
        {
          type: SessionType.Mela,
          mood: { displayName: 'Monk', key: 'monk' },
          icon: 'red-apple',
          totalDuration: Session.getDurationByType(SessionType.Mela)
        },
        {
          type: SessionType.Mela,
          mood: { displayName: 'Rage', key: 'rage' },
          icon: 'green-apple',
          totalDuration: Session.getDurationByType(SessionType.Mela)
        }
      ]
    };
  }

  get templateMoods(): IMood[] {
    return [
      { displayName: 'monk', key: 'monk' },
      { displayName: 'rage', key: 'rage' },
      { displayName: 'lo-fi', key: 'lo-fi' },
      { displayName: 'spy', key: 'spy' },
      { displayName: 'yogi', key: 'yogi' }
    ];
  }

}
