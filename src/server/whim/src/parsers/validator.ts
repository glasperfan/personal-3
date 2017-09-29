import { parseString } from './dates';
import * as moment from 'moment';

export class Validator {
  public static TagStartIdentifier = '#';
  public static NextWeekKeyword = 'next';
  public static EmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public static PhoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

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
    const result = parseString(s);
    return result && result.isValid();
  }

  public static capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
