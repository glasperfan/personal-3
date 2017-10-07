import { IParsedDate, IRecurrence } from '../../models';
export class OneTimeDate implements IParsedDate {
  public readonly endDate: number;
  public readonly recurrence: IRecurrence = {
    recurEvery: undefined,
    recurFor: undefined,
    isRecurrent: false
  };

  constructor(
    public startDate: number,
    public startInputText: string = undefined,
    public reminder: number = undefined) {}
}
