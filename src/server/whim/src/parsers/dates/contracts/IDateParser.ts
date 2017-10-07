import * as moment from 'moment';
import { IParsedDate } from '../../../models';

export interface IDateParser {
  parseString(s: string): IParsedDate;
  parseArray(s: string[]): IParsedDate;
}
