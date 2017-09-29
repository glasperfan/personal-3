import * as moment from 'moment';

export class DateParsingConstants {
  public static readonly SkipOneKeyword = 'next';
  public static readonly AlternatingKeyword = 'other';

  public static readonly AcceptedDatetimeFormats: string[] = [
    'M-D-YYYY h:mm a',  // 09-8-2017 5:04 PM
    'M-D-YY h:mm a',    // 09-8-17 5:04 AM
    'M/D/YYYY h:mm a',  // 09/8/2017 5:04 PM
    'M/D/YY h:mm a',    // 09/8/17 5:04 AM
    'MMMM Do YYYY',     // September 7th 1994
    'MMMM Do, YYYY',    // September 7th, 1994
    'MMMM D YYYY',      // September 7 1994
    'MMMM D, YYYY',     // September 7, 1994
    'M/D/YYYY',         // 09/8/2017,
    'M-D-YYYY',         // 09-8-2017,
    'M/D/YY',           // 09/8/17
    'M-D-YY',           // 09-8-17
    'MMMM Do',          // September 9th
    'MMMM D',           // September 9
    'MMM Do',           // Sep 9th, Sept 9th
    'MMM D',            // Sep 9, Sept 9
    'dddd',             // Saturday, Sunday
    'ddd',              // Sat, Sun
    'h:m a',            // 3:30 am
    'x'                 // Unix timestamp
  ];

  public static Now() {
    return moment(Date.now());
  };

  public static StartOfDay(d: moment.Moment): moment.Moment {
    return d.clone().startOf('day');
  }

  public static StartOfToday() {
    return this.StartOfDay(this.Now());
  }

  public static StartOfYesterday(d: moment.Moment): moment.Moment {
    return d.clone().startOf('day').subtract(1, 'day');
  }

  public static StartOfOneWeekBefore(d: moment.Moment): moment.Moment {
    return d.clone().startOf('day').subtract(1, 'week');
  }

  public static IsValidTimestamp(timestamp: number) {
    return !isNaN(new Date(timestamp).getTime());
  }
}
