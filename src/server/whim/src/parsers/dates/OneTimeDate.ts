import { IParsedDate, IRecurrence } from '../../models';
export class OneTimeDate implements IParsedDate {
  public readonly endDate: number;
  public recurrence: IRecurrence = {
    recurEvery: undefined,
    recurFor: undefined,
    isRecurrent: false
  };

  constructor(
    public readonly startDate: number,
    public readonly startInputText: string = undefined) {
    this.endDate = this.startDate;
  }
}
