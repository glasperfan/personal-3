export interface IParsedDate {
  startDate: number;
  endDate: number;
  startInputText: string;
  recurrence: IRecurrence;
  reminder: number;
}

export interface IRecurrence {
  recurEvery: IRecurEvery;
  recurFor: IRecurFor;
  isRecurrent: boolean;
}

export interface IRecurEvery {
  pattern: IRecurrenceUnit;
  isAlternating: boolean;
  inputText: string;
}

export interface IRecurFor {
  pattern: IRecurrenceUnit;
  isForever: boolean;
  inputText: string;
}

export interface IRecurrenceUnit {
  amount: number;
  interval: RecurrenceInterval;
}

export type RecurrenceInterval = 'day' | 'week' | 'month' | 'year';
export type DateUnits = 'days' | 'day' | 'weeks' | 'week' | 'months' | 'month' | 'years' | 'year';
