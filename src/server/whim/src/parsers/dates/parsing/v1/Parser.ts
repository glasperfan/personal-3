import { splice } from '../../../commands/splice';
import { IDateParser } from '../../contracts/IDateParser';
import { IParsedDate, IRecurEvery, IRecurFor, IRecurrenceUnit, RecurrenceInterval } from '../../../../models';
import * as moment from 'moment';
import { DateParsingConstants as Constants } from '../DateParsingConstants';

/**
 * V1 does not support:
 *  1. multiple dates in a single input
 *  2. inner words not related to the date (i.e. 'remind me' in the middle of the string)
 *
 * Approach is to split each string into 3 components.
 *  1. Start date (SD)
 *  2. Recurrence pattern (RP)
 *  3. Recurrence duration (RD)
 *
 * For example, "starting Monday every day for 2 weeks" breaks down into
 *  "starting Monday" (SD), "every day" (RP), "for 2 weeks" (RD)
 *
 * Component order does not matter.
 *
 * If recurrence is implied but not specified, the default recurrence will be:
 *  RP: 'every day'
 *  RD: 'forever'
 * */
export class DateParser implements IDateParser {
  private static Formats = Constants.AcceptedDateFormats.concat(Constants.AcceptedDatetimeFormats);
  private _isRecurrent = false;
  private _isAlternating = false;
  private _recurEvery: IRecurEvery;
  private _recurFor: IRecurFor;
  private _startDate: moment.Moment;
  private _s: string;
  private _startInputText: string;

  public parseArray(sArr: string[]): IParsedDate {
    return this.parseString(sArr.join(' '));
  }

  public parseString(s: string): IParsedDate {
    this._s = s = s && s.trim();
    this.extractStartDateComponents(s);
    this.extractRecurEveryComponents(s);
    this.extractRecurForComponents(s);
    const endDate = this.calculateEndDate();
    return {
      startDate: this._startDate.valueOf(),
      endDate: endDate,
      startInputText: this._startInputText,
      recurrence: {
        recurEvery: this._recurEvery,
        recurFor: this._recurFor,
        isRecurrent: this._isRecurrent
      },
      reminder: undefined
    };
  }

  // Parses everything from 'today' to 'Monday' to 'next week' to 'September 18th, 2018'
  private parseDate(s: string): moment.Moment {

    if (!s || !s.trim().length) {
      return undefined;
    }

    return this.parseKeywordDate(s) || this.parseExactDate(s);
  }

  private parseKeywordDate(input: string): moment.Moment {
    let s = input.trim(), startsNext = false;
    if (s.startsWith('this coming')) {
      startsNext = true;
      s = s.slice('this coming'.length + 1);
    } else if (s.startsWith('next')) {
      startsNext = true;
      s = s.slice('next'.length + 1);
    } else if (s.startsWith('this')) {
      s = s.slice('this'.length + 1);
    }

    let result: moment.Moment;
    switch (s.toLowerCase()) {
      case 'today':
        result = Constants.StartOfToday(); break;
      case 'tomorrow':
        result = Constants.StartOfTomorrow(Constants.Now()); break;
      case 'week':
        result = Constants.StartOfWeek(Constants.Now()).add(startsNext ? 1 : 0, 'day'); break;
      case 'month':
        result = Constants.StartOfMonth(Constants.Now()).add(startsNext ? 1 : 0, 'month'); break;
      case 'year':
        result = Constants.StartOfYear(Constants.Now()).add(startsNext ? 1 : 0, 'year'); break;
    }

    // Monday through Sunday
    if (!result) {
      const dayOfWeek = Constants.AsDayOfWeek(s);
      if (dayOfWeek) {
        result = dayOfWeek;
      }
    }

    return result;
  }

  private parseExactDate(input: string): moment.Moment {
    let s = input.trim(), startsNext = false;
    if (s.startsWith('next')) {
      startsNext = true;
      s = s.slice('next'.length + 1);
    }

    for (const format of DateParser.Formats) {
      const parsed = moment(s, format, true);
      if (parsed.isValid()) {
        return startsNext ? parsed.add(startsNext ? 1 : 0, 'year') : parsed;
      }
    }
    return undefined;
  }

  private extractRecurrenceUnit(s: string): IRecurrenceUnit {
    const components = s.split(' ').filter(x => !!x.length);
    let amount: number;
    let interval: RecurrenceInterval;
    if (!components.length) {
      return undefined;
    }
    // every [amount] [interval]
    if (components.length === 2) {
      if (isNaN(parseInt(components[0], 10))) {
        return undefined;
      }
      amount = parseInt(components[0], 10);
    }
    const intervalComponent = components[components.length === 2 ? 1 : 0];
    // every [interval]
    if (Constants.DateUnits.includes(intervalComponent)) {
      interval = Constants.DateUnitToRecurrenceInterval[intervalComponent];
    } else {
      return undefined;
    }
    return {
      amount: amount || 1,
      interval: interval
    };
  }

  // If 'on' and 'starting' both appear, attempt to parse both.
  // If both parse to dates, choose the 'starting' date.
  private extractStartDateComponents(s: string): void {
    const onTokenIdx = s.indexOf('on ');
    const startingTokenIdx = s.indexOf('starting ');
    const potentialendIdx = [
      s.indexOf('for '),
      s.indexOf('every '),
      s.length
    ];

    let startingStartDate: moment.Moment, onStartDate: moment.Moment;

    let startingTextComponent: string, onTextComponent: string;
    if (startingTokenIdx > -1) {
      this._isRecurrent = true;
      const endIdx = Math.min(...potentialendIdx.filter(idx => idx > startingTokenIdx));
      startingTextComponent = s.slice(startingTokenIdx + 'starting'.length + 1, endIdx);
      startingStartDate = this.parseDate(startingTextComponent);
    }

    if (onTokenIdx > -1) {
      const endIdx = Math.min(...potentialendIdx.filter(idx => idx > onTokenIdx));
      onTextComponent = s.slice(onTokenIdx + 'on'.length + 1, endIdx).trim();
      onStartDate = this.parseDate(onTextComponent);
    }

    if (startingStartDate) {
      this._startInputText = `starting ${startingTextComponent}`;
    } else if (onStartDate) {
      this._startInputText = `on ${onTextComponent}`;
    }

    this._startDate = startingStartDate || onStartDate || Constants.StartOfToday();
  }

  private extractRecurEveryComponents(s: string): void {
    const everyTokenIdx = s.indexOf('every ');
    this._isRecurrent = this._isRecurrent || everyTokenIdx > - 1;
    const defaultRecurrence: IRecurEvery = {
      pattern: {
        amount: 1,
        interval: 'day'
      },
      inputText: undefined,
      isAlternating: false
    };
    // default recurrence: 'every day'
    if (everyTokenIdx < 0 && this._isRecurrent) {
      this._recurEvery = defaultRecurrence;
    } else if (everyTokenIdx < 0) {
      this._recurEvery = {
        pattern: undefined,
        isAlternating: false,
        inputText: undefined
      };
    } else {
      const endIdx = Math.min(...[
        s.indexOf('on '),
        s.indexOf('starting '),
        s.indexOf('for '),
        s.length
      ].filter(idx => idx > everyTokenIdx));
      let everyComponent = s.slice(everyTokenIdx + 'every'.length + 1, endIdx);
      this._isAlternating = everyComponent.includes('other');
      if (this._isAlternating) {
        everyComponent = splice(everyComponent, everyComponent.indexOf('other '), 'other'.length, '');
      }
      const pattern = this.extractRecurrenceUnit(everyComponent);
      this._recurEvery = {
        pattern: pattern,
        isAlternating: this._isAlternating,
        inputText: pattern ? `every ${everyComponent}` : undefined
      };
    }
  }

  private extractRecurForComponents(s: string): void {
    // default: forever
    const defaultDuration: IRecurFor = {
      pattern: undefined,
      isForever: true,
      inputText: undefined
    };
    const forTokenIdx = s.indexOf('for ');
    if (forTokenIdx < 0 && this._isRecurrent) {
      this._recurFor = defaultDuration;
    } else if (forTokenIdx < 0) {
      this._recurFor = {
        pattern: undefined,
        isForever: false,
        inputText: undefined
      };
    } else {
      const endIdx = Math.min(...[
        s.indexOf('on '),
        s.indexOf('starting '),
        s.indexOf('every '),
        s.length
      ].filter(idx => idx > forTokenIdx));
      // 'forever ', 'for 2 weeks '
      let forComponent = s.slice(forTokenIdx, endIdx);
      if (forComponent.startsWith('forever')) {
        this._recurFor = defaultDuration;
      } else {
        forComponent = forComponent.slice('for'.length + 1);
        const pattern = this.extractRecurrenceUnit(forComponent);
        this._recurFor = {
          pattern: pattern,
          isForever: false,
          inputText: pattern ? `for ${forComponent}` : undefined
        };
      }
    }
  }

  private calculateEndDate(): number {
    if (!this._isRecurrent) {
      return this._startDate.valueOf();
    }
    if (this._recurFor.isForever) {
      return Number.MAX_SAFE_INTEGER;
    }
    // start date + duration
    return this._startDate
      .clone()
      .add(this._recurFor.pattern.amount, this._recurFor.pattern.interval)
      .valueOf();
  }
}
