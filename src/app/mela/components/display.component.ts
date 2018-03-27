import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { Timer } from './timer';
import { PlaylistService } from '../services';
import { ISession, MelaType, MELA_SESSION_LENGTH } from '../models';
declare var d3: any;

@Component({
  selector: 'p3-mela-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.less']
})
export class DisplayComponent implements OnInit, OnDestroy {

  public currentTimer: Timer;
  public newSessionName = '';
  public showAddSession = false;
  public timerCompleted = false;
  public timerNotStarted = true;
  public melaCounts: { [key: string]: number }
  public queuedSessions$: Observable<ISession[]>;
  public currentSession$: Observable<ISession>;
  private readonly sessionTimerElementId = 'session-timer';
  private readonly _subscriptions: Subscription[] = [];

  @ViewChild('sessionInput') sessionInputEl: ElementRef;

  constructor(public playlistSvc: PlaylistService) {
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
      this.timerNotStarted = true;
    }
    this.createChart(this.sessionTimerElementId, MELA_SESSION_LENGTH);
    this._subscriptions.push(
      // If the first session is added, initialize the timer.
      this.playlistSvc.newSessionCreated$.subscribe(_ => {
        if (this.playlistSvc.TotalQueuedSessions === 1) {
          this.createTimer();
          this.timerNotStarted = true;
        }
      })
    );
  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

  get melaKeys(): string[] {
    return Object.values(MelaType);
  }

  onAddSessionRequested(): void {
    if (this.showAddSession) {
      this.onSubmitSessionInput(true);
    }
    this.showAddSession = true;
    setTimeout(() => this.sessionInputEl.nativeElement.focus(), 50);
    window.scrollTo(0, document.body.scrollHeight);
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
        this.timerNotStarted = true;
      } else {
        this.timerNotStarted = false;
        this.deleteTimer();
      }
    }
    this.timerCompleted = false;
    this.playlistSvc.deleteSession(sessionIdx);
  }

  onTimerEnd(): void {
    this.timerNotStarted = false;
    this.timerCompleted = true;
  }
  
  onTimerComplete(): void {
    // update streak
    this.melaCounts[this.playlistSvc.currentSession.mela] += 1;
    // delete current session, select next one
    this.playlistSvc.deleteSession(0);
    // reset timer
    this.createTimer();
    // remove complete button
    this.timerCompleted = false;
    this.timerNotStarted = true;
  }

  onTimerStart(): void {
    this.currentTimer.start();
    this.currentTimer.timerEnded$.subscribe(() => setTimeout(() => this.onTimerEnd(), 0));
    this.timerNotStarted = false;
  }

  createTimer(time: number = MELA_SESSION_LENGTH): void {
    this.currentTimer = new Timer(time);
  }

  deleteTimer(): void {
    this.currentTimer = undefined;
  }

  createChart(element: string, time: number) {
    const width = 60, height = 60;

    const fields = [
      { value: time, size: time, label: 'm', update: _ => this.currentTimer && this.currentTimer.minutesPassed || 0 },
    ];

    const arc = d3.svg.arc()
    .innerRadius(width / 8)
    .outerRadius(width / 2.1)
    .startAngle(0)
    .endAngle(function(d) { return (d.value / d.size) * 2 * Math.PI; });

    const svg = d3.select('#' + element).append('svg')
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
