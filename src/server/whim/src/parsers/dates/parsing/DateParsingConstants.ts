import { RecurrenceInterval, IRecurEvery, IRecurFor } from '../../../models';
import * as moment from 'moment';

export class DateParsingConstants {
  public static readonly SkipOneKeyword = 'next';
  public static readonly AlternatingKeyword = 'other';

  public static readonly AcceptedDateFormats: string[] = [
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
    'MMM D'            // Sep 9, Sept 9
  ];

  public static readonly AcceptedWeekDateFormats: string[] = [
    'dddd',             // Saturday, Sunday
    'ddd'              // Sat, Sun
  ];

  public static readonly AcceptedTimeFormats: string[] = [
    'h:m a'            // 3:30 am
  ];

  public static readonly AcceptedDatetimeFormats: string[] = [
    'M-D-YYYY h:mm a',  // 09-8-2017 5:04 PM
    'M-D-YY h:mm a',    // 09-8-17 5:04 AM
    'M/D/YYYY h:mm a',  // 09/8/2017 5:04 PM
    'M/D/YY h:mm a',    // 09/8/17 5:04 AM
    'x'                 // Unix timestamp
  ];

  public static readonly DateUnits: string[] = [
    'day', 'week', 'month', 'year',
    'days', 'weeks', 'months', 'years'
  ];

  public static readonly Weekday: string[] = [
    'Monday', 'monday',
    'Tuesday', 'tuesday',
    'Wednesday', 'wednesday',
    'Thursday', 'thursday',
    'Friday', 'friday',
    'Saturday', 'saturday',
    'Sunday', 'sunday'
  ];

  public static readonly DateUnitToRecurrenceInterval: { [unit: string]: RecurrenceInterval } = {
    'day': 'day',
    'days': 'day',
    'week': 'week',
    'weeks': 'week',
    'month': 'month',
    'months': 'month',
    'year': 'year',
    'years': 'year'
  };

  public static AsDayOfWeek(s: string): moment.Moment {
    const m = moment(s, 'dddd');
    return m.isValid() ? m : undefined;
  }

  public static Now(): moment.Moment {
    return moment(Date.now());
  };

  public static StartOfDay(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('day');
  }

  public static StartOfToday(): moment.Moment {
    return this.StartOfDay(this.Now());
  }

  public static StartOfTomorrow(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('day').add(1, 'day');
  }

  public static StartOfYesterday(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('day').subtract(1, 'day');
  }

  public static StartOfWeek(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('week');
  }

  public static StartOfNextWeek(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('week').add(1, 'week');
  }

  public static StartOfMonth(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('month');
  }

  public static StartOfYear(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('year');
  }

  public static StartOfOneWeekBefore(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('day').subtract(1, 'week');
  }

  public static NearestWeekday(weekday: string, d?: moment.Moment) {
    if (!this.Weekday.includes(weekday)) {
      throw TypeError('Not a valid weekday');
    }
    const m = (d || moment()).day(weekday);
    while (m < this.Now()) {
      m.add(1, 'week');
    }
    return m;
  }

  public static IsValidTimestamp(timestamp: number): boolean {
    return !isNaN(new Date(timestamp).getTime());
  }

  public static get DefaultStartDate(): moment.Moment {
    return this.StartOfToday();
  }

  public static get YearlyRecurrence(): IRecurEvery {
    return {
      pattern: {
        amount: 1,
        interval: 'year'
      },
      inputText: undefined,
      isAlternating: false
    };
  }

  public static get WeeklyRecurrence(): IRecurEvery {
    return {
      pattern: {
        amount: 1,
        interval: 'week'
      },
      inputText: undefined,
      isAlternating: false
    };
  }

  public static get DefaultRecurrence(): IRecurEvery {
    return {
      pattern: {
        amount: 1,
        interval: 'day'
      },
      inputText: undefined,
      isAlternating: false
    };
  }

  public static get NoRecurrence(): IRecurEvery {
    return {
      pattern: undefined,
      isAlternating: false,
      inputText: undefined
    };
  }

  public static get DefaultDuration(): IRecurFor {
    return {
      pattern: undefined,
      isForever: true,
      inputText: undefined
    };
  }

  public static get NoDuration(): IRecurFor {
    return {
      pattern: undefined,
      isForever: false,
      inputText: undefined
    };
  }
}
