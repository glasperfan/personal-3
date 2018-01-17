import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Timer } from './timer';
import { PlaylistService } from '../services';
import { ISession } from '../models';
declare var d3: any;

@Component({
  selector: 'p3-mela-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.less']
})
export class DisplayComponent implements OnInit {

  private value = (new Date()).getSeconds();
  public currentTimer: Timer;
  public currentSession$: Observable<ISession>;
  private readonly sessionTimerElementId = 'session-timer';

  constructor(public playlistSvc: PlaylistService) {
    this.currentSession$ = this.playlistSvc.currentSession$;
  }

  ngOnInit() {
    this.currentSession$.subscribe(s => {
      this.createChart(this.sessionTimerElementId, s.totalDuration);
    });
    // this.hideChart();
  }

  playVideo() {
    const el = document.getElementById('video');
    el.innerHTML = `<iframe width="0" height="0" frameborder="0" id="video"
      src="https://www.youtube.com/embed/Y2V6yjjPbX0?autoplay=1"
      allow="autoplay;encrypted-media"></iframe>`;
  }

  createChart(element: string, time: number) {
    const width = 310, height = 310;

    this.currentTimer = new Timer(time);
    this.currentTimer.start();

    const fields = [
      { value: time, size: time, label: 'm', update: _ => this.currentTimer.minutesPassed },
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
}
