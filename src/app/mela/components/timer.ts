export class Timer {
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
    const sl = Math.floor(this.secondsLeft);
    if (sl === 0) {
      return '00';
    }
    return ml < 10 ? '0' + ml.toPrecision(1) : ml.toPrecision(2);
  }

  get secondsLeftString() {
    const sl = Math.floor(this.secondsLeft);
    if (sl === 0) {
      return '00';
    }
    return sl < 10 ? '0' + sl.toPrecision(1) : sl.toPrecision(2);
  }

  get minutesPassed() {
    if (!this.started) {
      return 0;
    }
    const mins = (this.currentTimeInSeconds - this.timeStarted) / 60;
    // console.log('mins', mins);
    // if (mins < 1) {
    //   return 0;
    // }
    return mins;
  }

  get secondsPassed() {
    if (!this.started) {
      return 0;
    }
    const seconds = (this.currentTimeInSeconds - this.timeStarted) % 60;
    // console.log('seconds', seconds);
    if (seconds < 1) {
      return 0;
    }
    return seconds;
  }

  get minutesLeft() {
    if (!this.started) {
      return 0;
    }
    const mins = (this.endTime - this.currentTimeInSeconds) / 60;
    // console.log('mins', mins);
    return mins;
  }
  get secondsLeft() {
    if (!this.started) {
      return 0;
    }
    const seconds = (this.endTime - this.currentTimeInSeconds) % 60;
    // console.log('seconds', seconds);
    if (seconds < 1) {
      return 0;
    }
    return seconds;
  }

  get currentTimeInSeconds() { return new Date().getTime() / 1000; }
}
