import { Component, OnInit } from '@angular/core';
declare var d3: any;

@Component({
  selector: 'p3-mela-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.less']
})
export class DisplayComponent implements OnInit {

  private timeLeft = 13;
  private value = (new Date()).getSeconds();
  private currentTimer: Timer;

  ngOnInit() {
    this.createChart('session-timer', 25);
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

class Timer {
  private secondsCounter = 0;
  private started = false;
  private endTime: number; // timestamp
  private timeStarted: number; // timestamp
  constructor(public totalMinutes: number) { }

  start() {
    this.timeStarted = this.currentTimeInSeconds; // in seconds
    this.endTime = this.timeStarted + (60 * this.totalMinutes);
    this.started = true;
  }

  get minutesLeftString() {
    const ml = Math.floor(this.minutesLeft);
    return ml < 10 ? '0' + ml.toPrecision(1) : ml.toPrecision(2);
  }

  get secondsLeftString() {
    const sl = Math.floor(this.secondsLeft);
    return sl < 10 ? '0' + sl.toPrecision(1) : sl.toPrecision(2);
  }

  get minutesPassed() {
    if (!this.started) {
      return 0;
    }
    const mins = (this.currentTimeInSeconds - this.timeStarted) / 60;
    console.log('mins', mins);
    return mins;
  }

  get secondsPassed() {
    if (!this.started) {
      return 0;
    }
    const seconds = (this.currentTimeInSeconds - this.timeStarted) % 60;
    console.log('seconds', seconds);
    return seconds;
  }

  get minutesLeft() {
    if (!this.started) {
      return 0;
    }
    const mins = (this.endTime - this.currentTimeInSeconds) / 60;
    console.log('mins', mins);
    return mins;
  }
  get secondsLeft() {
    if (!this.started) {
      return 0;
    }
    const seconds = (this.endTime - this.currentTimeInSeconds) % 60;
    console.log('seconds', seconds);
    return seconds;
  }

  get currentTimeInSeconds() { return new Date().getTime() / 1000; }
}
