import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { Timer } from './timer';
import { PlaylistService } from '../services';
import { ISession, MelaType, MELA_SESSION_LENGTH } from '../models';
declare var d3: any;
declare var Mousetrap: any;

@Component({
  selector: 'p3-mela-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.less']
})
export class DisplayComponent implements OnInit, OnDestroy {

  public currentTimer: Timer;
  public newSessionName = '';
  public showAddSession = false;
  public sessionIsFinished = false;
  public sessionIsRunning = false;
  public sessionIsPaused = false;
  public sessionIsReady = false;
  public melaCounts: { [key: string]: number }
  public queuedSessions$: Observable<ISession[]>;
  public currentSession$: Observable<ISession>;
  private readonly sessionTimerElementId = 'session-timer';
  private readonly _subscriptions: Subscription[] = [];
  private _timerSubscription: Subscription;

  constructor(public playlistSvc: PlaylistService, private zone: NgZone) {
    this.queuedSessions$ = this.playlistSvc.currentPlaylist$.map(plylst => plylst.sessions);
    this.currentSession$ = this.playlistSvc.currentSession$;
    this.melaCounts = {};
    for (const key of this.melaKeys) {
      this.melaCounts[key] = 0;
    }
  }

  ngOnInit() {
    if (this.playlistSvc.TotalQueuedSessions > 0) {
      this.createTimer();
      this.sessionIsReady = true;
    }
    this.createChart(this.sessionTimerElementId, MELA_SESSION_LENGTH);
    this._subscriptions.push(
      // If the first session is added, initialize the timer.
      this.playlistSvc.newSessionCreated$.subscribe(_ => {
        if (this.playlistSvc.TotalQueuedSessions === 1) {
          this.createTimer();
          this.sessionIsReady = true;
        }
      })
    );
    this.activateAddSessionBinding();
  }

  public activateAddSessionBinding(): void {
    const self = this;
    Mousetrap.bind('q', function() { console.log('add session'); self.onAddSessionRequested(); });
  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

  get melaKeys(): string[] {
    return Object.values(MelaType);
  }

  onAddSessionRequested(): void {
    const self = this;
    if (self.showAddSession) {
      self.onSubmitSessionInput(true);
    }
    self.showAddSession = true;
    self.zone.run(() => {
      setTimeout(() => {
        (<HTMLElement>document.getElementsByClassName('add-session-input')[0]).focus();
      }, 50);
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  onAddFirstSessionPrompt(): void {
    if (!this.showAddSession) {
      this.onAddSessionRequested();
    }
  }

  onAddSessionInput(inputValue: string): void {
    this.newSessionName = inputValue;
  }

  onSubmitSessionInput(stillShowInput: boolean = false): void {
    this.playlistSvc.addSession(this.newSessionName.trim());
    this.showAddSession = stillShowInput;
    this.newSessionName = '';
  }

  onCancelSessionInput(): void {
    this.showAddSession = false;
    this.newSessionName = '';
  }

  onDeleteSession(sessionIdx: number): void {
    if (sessionIdx === 0) {
      this.createTimer();
      if (this.playlistSvc.TotalQueuedSessions > 1) {
        this.sessionIsReady = true;
      } else {
        this.sessionIsReady = false;
        this.deleteTimer();
      }
    }
    this.sessionIsFinished = false;
    this.playlistSvc.deleteSession(sessionIdx);
  }

  onTimerEnd(): void {
    this.sessionIsFinished = true;
  }
  
  onTimerComplete(): void {
    // update streak
    this.melaCounts[this.playlistSvc.currentSession.mela] += 1;
    // delete current session and select the next one
    this.playlistSvc.deleteCurrentSession();
    // reset timer
    this._timerSubscription.unsubscribe();
    this._timerSubscription = undefined;
    this.createTimer();
    // remove complete button
    this.sessionIsFinished = false;
    this.sessionIsRunning = false;
    this.sessionIsReady = !!this.playlistSvc.currentSession;
  }

  onTimerStart(): void {
    this.currentTimer.start();
    this._timerSubscription = this.currentTimer.timerEnded$.subscribe(() => setTimeout(() => this.onTimerEnd(), 0));
    this.sessionIsReady = false;
    this.sessionIsRunning = true;
  }

  onTimerPause(): void {
    this.sessionIsRunning = false;
    this.sessionIsPaused = true;
    this.currentTimer.pause();
  }

  onTimerResume(): void {
    this.sessionIsRunning = true;
    this.sessionIsPaused = false;
    this.currentTimer.resume();
  }

  createTimer(time: number = MELA_SESSION_LENGTH): void {
    this.currentTimer = new Timer(time);
  }

  deleteTimer(): void {
    this.currentTimer = undefined;
  }

  get shouldShowComplete(): boolean {
    return this.sessionIsFinished || this.sessionIsRunning;
  }


  /* --- CHART --- */

  createChart(element: string, time: number) {
    const width = 60, height = 60;

    const fields = [
      { value: time, size: time, label: 'm', update: _ => this.currentTimer && this.currentTimer.minutesPassed || time },
    ];

    const arc = d3.svg.arc()
    .innerRadius(width / 8)
    .outerRadius(width / 2.1)
    .startAngle(0)
    .endAngle(function(d) { return (d.value / d.size) * 2 * Math.PI; });

    const svg = d3.select('#' + element).append('svg')
    .style({'fill': '#f05545', 'stroke': '#f05545'})
    .attr('width', width)
    .attr('height', height);

    const field = svg.selectAll('.field')
      .data(fields)
      .enter().append('g')
      .attr('transform', function(d, i) { return 'translate(' + (i + 1) / 2 * width + ',' + height / 2 + ')'; })
      .attr('class', 'field');

    field.append('path')
      .attr('class', 'path path--background')
      .attr('d', arc);

    const path = field.append('path')
      .attr('class', 'path path--foreground');

    // Update
    (function update() {
      const now = new Date();

      field.each(d => {
          d.previous = d.value;
          d.value = d.update(now);
        });

      path.transition()
          .ease('elastic')
          .duration(750)
          .attrTween('d', arcTween);

      setTimeout(update, 1000 - (now.getTime() % 1000));
    })();

    function arcTween(b) {
      const i = d3.interpolate({value: b.previous}, b);
      return function(t) {
        return arc(i(t));
      };
    }
  }

  get formatTimeLeft(): string {
    if (this.currentTimer) {
      const ml = Math.floor(this.currentTimer.minutesLeft);
      if (ml) {
        return `${ml} minutes left`;
      }
      const sl = Math.floor(this.currentTimer.secondsLeft);
      if (sl) {
        return `${sl} seconds left`;
      }
      return 'finished';
    }
    return undefined;
  }
}
