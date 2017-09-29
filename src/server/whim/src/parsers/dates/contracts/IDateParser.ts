import * as moment from 'moment';

export interface IDateParser {
  parseString(s: string): moment.Moment;
  parseArray(s: string[]): moment.Moment;
}
