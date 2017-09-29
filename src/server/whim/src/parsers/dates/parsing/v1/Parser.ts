import { IDateParser } from '../../contracts/IDateParser';
import * as moment from 'moment';
import { DateParsingConstants as Constants } from '../DateParsingConstants';

/* V1 does not support:
 *  Multiple dates in a single input
 *  Alternating dates
 */
export class DateParser implements IDateParser {

  private static readonly Keywords: string[] = [
    'today',
    'tomorow',
    'next week'
  ];

  private static readonly AcceptedDatetimeKeywords: any[] = [
    ['today', moment(new Date())],
    ['tomorrow', moment(new Date()).add(1, 'days')],
    ['next week', moment(new Date()).add(1, 'weeks')],
    ['next month', moment(new Date()).add(1, 'months').date(1)]
  ];

  public parseArray(sArr: string[]): moment.Moment {
    return this.parseString(sArr.join(' '));
  }

  public parseString(s: string): moment.Moment {
    let result: moment.Moment;

    if (!s || !s.length) {
      return result;
    }

    // First try keywords
    for (const format of DateParser.AcceptedDatetimeKeywords) {
      if (format[0] === s) {
        result = format[1];
        break;
      }
    }

    // Then try all formats until one succeeds
    const hasNextPrefix = s.startsWith(Constants.SkipOneKeyword);
    const sMinusNext = hasNextPrefix ? s.slice(Constants.SkipOneKeyword.length + 1) : s;
    for (const format of Constants.AcceptedDatetimeFormats) {
      const parsed = moment(sMinusNext, format, true);
      if (parsed.isValid()) {
        result = hasNextPrefix ? parsed.add(1, 'weeks') : parsed;
        break;
      }
    }

    return result;
  }
}
