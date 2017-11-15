import { RecurrenceInterval, IRecurEvery, IRecurFor } from '../../../models';
import * as moment from 'moment';
import { keyBy } from 'lodash';

export class DateParsingConstants {
  public static readonly SkipOneKeyword = 'next';
  public static readonly AlternatingKeyword = 'other';

  public static readonly AcceptedDateFormats: string[] = [
    'MMMM Do YYYY',     // September 7th 1994
    'MMMM Do, YYYY',    // September 7th, 1994
    'MMMM D YYYY',      // September 7 1994
    'MMMM D, YYYY',     // September 7, 1994
    'M/D/YYYY',         // 9/8/2017
    'M/D/YY',           // 9/8/17
    'M-D-YYYY',         // 9-8-2017
    'M-D-YY',           // 9-8-17
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

  public static readonly Month: string[] = [
    'January', 'january',
    'Feburary', 'february',
    'March', 'march',
    'April', 'april',
    'May', 'may',
    'June', 'june',
    'July', 'july',
    'August', 'august',
    'September', 'september',
    'October', 'october',
    'November', 'november',
    'December', 'december'
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

  public static readonly TimeKeywordLookup = Object.assign(
    DateParsingConstants.DateUnitToRecurrenceInterval, keyBy(
    DateParsingConstants.Weekday
      .concat(DateParsingConstants.Month)
      .concat([
        // common phrases
        'today',
        'yesterday',
        'tomorrow',
        'everyday',
        // common keywords (i.e. '*is* Friday', '*every* week')
        'is',
        'on',
        'every',
        'for',
        'until',
        'this',
        'next'
      ])
  ));

  public static AsDayOfWeek(s: string): moment.Moment {
    const m = moment(s, 'dddd', true);
    return m.isValid() ? m : undefined;
  }

  public static Now(): moment.Moment {
    return moment();
  };

  public static StartOfDay(d?: moment.Moment): moment.Moment {
    return (d || this.Now()).clone().startOf('day');
  }

  public static StartOfToday(): moment.Moment {
    return this.StartOfDay(this.Now());
  }

  public static StartOfTomorrow(d?: moment.Moment): moment.Moment {
    return (d || this.StartOfToday()).clone().startOf('day').add(1, 'day');
  }

  public static StartOfYesterday(d?: moment.Moment): moment.Moment {
    return (d || this.StartOfToday()).clone().startOf('day').subtract(1, 'day');
  }

  public static StartOfWeek(d?: moment.Moment): moment.Moment {
    return (d || this.StartOfToday()).clone().startOf('week');
  }

  public static StartOfNextWeek(d?: moment.Moment): moment.Moment {
    return (d || this.StartOfToday()).clone().startOf('week').add(1, 'week');
  }

  public static StartOfMonth(d?: moment.Moment): moment.Moment {
    return (d || this.StartOfToday()).clone().startOf('month');
  }

  public static StartOfYear(d?: moment.Moment): moment.Moment {
    return (d || this.StartOfToday()).clone().startOf('year');
  }

  public static StartOfOneWeekBefore(d?: moment.Moment): moment.Moment {
    return (d || this.StartOfToday()).clone().startOf('day').subtract(1, 'week');
  }

  public static NearestWeekday(weekday: string, d?: moment.Moment) {
    if (!this.Weekday.includes(weekday)) {
      throw TypeError('Not a valid weekday');
    }
    const m = (d || this.StartOfToday()).day(weekday);
    while (m < this.StartOfToday()) {
      m.add(1, 'week');
    }
    return m;
  }

  public static DaysUntil(d: moment.Moment, starting?: moment.Moment): number {
    return this.SafeDiff(starting || this.StartOfToday(), d) + 1;
  }

  public static SafeDiff(a: moment.Moment, b: moment.Moment): number {
    return Math.abs(this.StartOfDay(a).diff(this.StartOfDay(b), 'days'));
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
