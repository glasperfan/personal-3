import { DateParser } from './dates';
import * as moment from 'moment';

export class Validator {
  public static TagStartIdentifier = '#';
  public static NextWeekKeyword = 'next';
  public static EmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public static ExactPhoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  public static PhoneRegex = /\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/;

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
    return this.ExactPhoneRegex.test(s);
  }

  public static firstPhoneNumber(s: string): string {
    const re = new RegExp(this.PhoneRegex, 'g');
    const matches = re.exec(s);
    if (!matches) {
      return undefined;
    }
    return matches.filter(x => x.length > 4).sort((a, b) => b.length - a.length).shift();
  }

  public static isName(s: string): boolean {
    const componentCount = s.trim().split(' ').length;
    return componentCount >= 2 && componentCount <= 3;
  }

  // Move to Formatter
  public static capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  public static normalize(s: string, trim: boolean = true, lowercase: boolean = true, removeCommas: boolean = true, removePeriods: boolean = true): string {
    if (trim) {
      s = s.trim();
    }
    if (lowercase) {
      s = s.toLowerCase();
    }
    if (removeCommas) {
      s = s.replace(/\,/g, '');
    }
    if (removePeriods) {
      s = s.replace(/\./g, '');
    }
    return s;
  }
}
