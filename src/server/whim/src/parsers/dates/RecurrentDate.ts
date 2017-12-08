import { IEventMetadata } from '../../models';
import { DateParsingConstants } from './parsing/DateParsingConstants';
import { IRecurEvery, IRecurFor, IRecurrence, IParsedDate } from '../../models/date';
import * as moment from 'moment';

export class RecurrentDate implements IParsedDate {
  public readonly endDate: number;
  public readonly recurrence: IRecurrence;
  constructor(
    public readonly startDate: number,
    public readonly startInputText: string,
    public readonly recurEvery?: IRecurEvery,
    public readonly recurFor?: IRecurFor) {
    this.recurrence = {
      recurEvery: recurEvery,
      recurFor: recurFor,
      isRecurrent: true
    };
    this.endDate = DateParsingConstants.CalculateEndDate(
      moment(startDate, 'x', true), true, recurFor);
  }
}
