import * as moment from 'moment-timezone';

export class Validator {
  public static TagStartIdentifier = '#';
  public static NextWeekKeyword = 'next';
  public static EmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public static PhoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  public static AcceptedDatetimeKeywords: any[] = [
    ['today', moment(new Date())],
    ['tomorrow', moment(new Date()).add(1, 'days')],
    ['next week', moment(new Date()).add(1, 'weeks')],
    ['next month', moment(new Date()).add(1, 'months').date(1)]
  ];

  public static AcceptedDatetimeFormats: string[] = [
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

  public static Today = moment(new Date());

  public static isTagStart(s: string): boolean {
    return s.startsWith(Validator.TagStartIdentifier);
  }

  public static isTag(s: string): boolean {
    return s.startsWith(Validator.TagStartIdentifier) &&
      s.length > Validator.TagStartIdentifier.length;
  }

  public static isEmail(s: string): boolean {
    return this.EmailRegex.test(s);
  }

  public static isPhoneNumber(s: string): boolean {
    return this.PhoneRegex.test(s);
  }

  public static isName(s: string): boolean {
    const componentCount = s.trim().split(' ').length;
    return componentCount >= 2 && componentCount <= 3;
  }

  public static isDate(s: string): boolean {
    const result = this.parseDate(s);
    return result && result.isValid();
  }

  public static capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  public static parseDate(s: string, ensureAfterNow: boolean = false): moment.Moment {
    let result: moment.Moment;

    if (!s || !s.length) {
      return result;
    }

    // First try keywords
    for (const format of this.AcceptedDatetimeKeywords) {
      if (format[0] === s) {
        result = format[1];
        break;
      }
    }

    // Then try all formats until one succeeds
    const hasNextPrefix = s.startsWith(this.NextWeekKeyword);
    const sMinusNext = hasNextPrefix ? s.slice(this.NextWeekKeyword.length + 1) : s;
    for (const format of this.AcceptedDatetimeFormats) {
      const parsed = moment(sMinusNext, format, true);
      if (parsed.isValid()) {
        result = hasNextPrefix ? parsed.add(1, 'weeks') : parsed;
        break;
      }
    }

    // Last ditch attempt
    // const blindParse = moment(s);
    // if (blindParse.isValid()) {
    //   result = blindParse;
    // }

    if (ensureAfterNow) {
      while (result.isBefore(Validator.Today)) {
        result = result.add(1, 'days');
      }
    }

    return result;
  }
}
