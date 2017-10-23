import { splice } from '../../../commands/splice';
import { IDateParser } from '../../contracts/IDateParser';
import { IParsedDate, IRecurEvery, IRecurFor, IRecurrence, IRecurrenceUnit, RecurrenceInterval } from '../../../../models';
import * as moment from 'moment';
import { DateParsingConstants as Constants } from '../DateParsingConstants';

/**
 * V1 does not support:
 *  1. multiple dates in a single input
 *  2. inner words not related to the date (i.e. 'remind me' in the middle of the string)
 *  3. Assumes all dates are described in a single sentence.
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
 *
 * For the 3rd assumption, consider the sentence: "Jeff goes to the store on
 * Monday. He will go every week." We assume that each sentence describes up to
 * 1 date. So "on Monday" is one day and "every week".
 * Potentially in a later version, we are able to associate the 2 date information
 * fragments, since they form a composite date together.
 * */
export class DateParser implements IDateParser {
  private static Keywords = ['for', 'every', 'starting', 'on', 'is', 'until'];
  private static MinorKeywords = ['next', 'this'];
  private static CommonDateTerms = ['today', 'tomorrow', 'yesterday'].concat(Constants.Weekday);
  private _s: string;

  public parseArray(sArr: string[]): IParsedDate {
    return this.parseString(sArr.join(' '));
  }

  public parseString(s: string): IParsedDate {
    this._s = s = s && s.trim();
    // Split by sentence
    const sentences = s.split('. ');

    // For each sentence, find potential date information fragments.
    for (const sentence of sentences) {
      const fragments = this.extractFragments(sentence);
      const fragParser = new FragmentParser(fragments);
      const extractedDate = fragParser.extract();
      if (extractedDate) {
        return extractedDate;
      }
    }
    return undefined;
  }

  private extractFragments(sentence: string): string[] {
    let fragments: string[] = [];
    let currentFragment: string[] = [];
    const words = sentence.split(' ');
    for (const word of words) {
      const lc = word.toLowerCase();
      if (DateParser.Keywords.includes(lc)) { // start of fragment
        if (currentFragment.length) {
          fragments = fragments.concat(this.explode(currentFragment));
        }
        currentFragment = [word];
      } else if (currentFragment.length) { // continuation of fragment
        currentFragment.push(word);
      } else if (DateParser.MinorKeywords.includes(lc)) {
        if (currentFragment.length) {
          fragments = fragments.concat(this.explode(currentFragment));
        }
        currentFragment = [word];
      } else if (DateParser.CommonDateTerms.includes(lc)) {
        // 'today', 'tomorrow', 'yesterday', 'Friday', 'tuesday'...
        if (currentFragment.length) {
          fragments = fragments.concat(this.explode(currentFragment));
        }
        currentFragment = [word];
      } else if (Constants.Month.includes(lc)) {
        // 'October', 'november', 'may'
        if (currentFragment.length) {
          fragments = fragments.concat(this.explode(currentFragment));
        }
        currentFragment = [word];
      }
    }

    // Flush last fragment
    if (currentFragment.length) {
      fragments = fragments.concat(this.explode(currentFragment));
    }

    // Although slow, if we don't find any fragments, try every word.
    return fragments.length ? fragments : words;
  }

  /** 'Starting Monday I will go. => [
   *    'Starting Monday',
   *    'Starting Monday I',
   *    'Starting Monday I will']
   *  We assume the longest date in word length is 4. (i.e. On September 18th 2017)
   * */
  private explode(words: string[]): string[] {
    const options = [];
    for (let i = 2; i <= 4; i++) {
      if (words.length >= i) {
        options.push(words.slice(0, i).join(' '));
      }
    }
    return options;
  }
}

/**
 * We break each sentence into fragments, and then test for a valid date within it.
 * If no fragment provides date information, return undefined.
 * Use FragmentParser properties to access any extract information from an input sentence.
 *
 */
class FragmentParser {
  private static Formats = Constants.AcceptedDateFormats.concat(Constants.AcceptedDatetimeFormats);
  public fragments: string[];
  private _isRecurrent = false;
  private _isAlternating = false;
  private _recurEvery: IRecurEvery;
  private _recurFor: IRecurFor;
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;
  private _startInputText: string;
  private _result: IParsedDate;
  constructor(fragments: string[]) {
    // We sort by greatest length so that fragments with
    // the most information are tried first.
    this.fragments = fragments.sort((a, b) => b.length - a.length);
  }

  public extract(): IParsedDate {
    if (!this.fragments.length) {
      return undefined;
    }

    if (this._result) {
      return this._result;
    }

    for (const fragment of this.fragments) {
      const keyword = this.normalizeFragment(fragment.split(' ')[0]);
      switch (keyword) {
        case 'everyday':
        case 'every':
          if (!this._recurEvery) {
            this._recurEvery = this.extractRecurEveryComponents(fragment);
          }
          break;
        case 'forever':
        case 'for':
        case 'until':
          if (!this._recurFor) {
            this._recurFor = this.extractRecurForComponents(fragment);
          }
          break;
        case 'starting':
        case 'on':
        case 'is':
        default:
          if (!this._startDate) {
            this._startDate = this.extractStartDateComponents(fragment);
          }
      }
    }

    if (this.noDateDetected) {
      return undefined;
    }

    // Fill in defaults
    this._startDate = this._startDate || Constants.DefaultStartDate;
    this._recurEvery = this._recurEvery || (this._isRecurrent ? Constants.DefaultRecurrence : Constants.NoRecurrence);
    this._recurFor = this._recurFor || (this._isRecurrent ? Constants.DefaultDuration : Constants.NoDuration);

    const endDate = this.calculateEndDate();
    this._result = {
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
    return this._result;
  }

  /** 'starting [date]', 'on [date]', 'is [date]', '[date]' */
  private extractStartDateComponents(text: string): moment.Moment {
    const s = this.normalizeFragment(text);
    this._isRecurrent = this._isRecurrent || s.startsWith('starting ');
    const withoutPrefix = s.replace(/\bstarting \b|\bon \b|\bis \b/, '');
    const startDate = this.parseDate(withoutPrefix);
    this._startInputText = startDate ? this.normalizeForDisplay(text) : undefined;
    return startDate;
  }

  /** 'every [interval]', 'every other [interval]', 'every [date]', 'every other [date]' */
  private extractRecurEveryComponents(text: string): IRecurEvery {
    const s = this.normalizeFragment(text);

    if (s === 'everyday' || s === 'every day') {
      this._isRecurrent = true;
      const recurrence = Constants.DefaultRecurrence; // daily
      recurrence.inputText = this.normalizeForDisplay(text);
      return recurrence;
    }

    const everySomething = s.startsWith('every ');
    this._isRecurrent = this._isRecurrent || everySomething;

    // default recurrence: 'every day'
    if (!everySomething && this._isRecurrent) {
      return Constants.DefaultRecurrence;
    } else if (!everySomething) {
      return undefined;
    } else {
      let withoutPrefix = s.replace('every ', '');
      this._isAlternating = s.includes('other ');
      if (this._isAlternating) {
        withoutPrefix = withoutPrefix.replace('other ', '');
      }
      const pattern = this.extractRecurrenceUnit(withoutPrefix);
      if (pattern) { // every 2 days
        return {
          pattern: pattern,
          isAlternating: this._isAlternating,
          inputText: this.normalizeForDisplay(text)
        };
      }
      if (!this._startDate) { // every Wednesday, every September 1st
        const startingDate = this.parseDate(withoutPrefix);
        if (startingDate) {
          this._startDate = startingDate;
          const recurrence = this.inferRecurrenceFromDate(withoutPrefix);
          recurrence.isAlternating = this._isAlternating;
          recurrence.inputText = this.normalizeForDisplay(text);
          return recurrence;
        }
      }
      return undefined;
    }
  }

  /** 'forever', 'for [duration]' */
  private extractRecurForComponents(text: string): IRecurFor {
    const s = this.normalizeFragment(text);
    if (s === 'forever') {
      this._isRecurrent = true;
      const duration = Constants.DefaultDuration; // forever
      duration.inputText = this.normalizeForDisplay(text);
      return duration;
    }

    const hasPrefix = s.startsWith('for ') || s.startsWith('until ');

    if (!hasPrefix && this._isRecurrent) {
      return Constants.DefaultDuration;
    } else if (!hasPrefix) {
      return undefined;
    } else {
      const withoutPrefix = s.replace('for ', '').replace('until ', '');
      const pattern = this.extractRecurrenceUnit(withoutPrefix);
      if (pattern) { // for 2 days
        this._isRecurrent = true;
        return {
          pattern: pattern,
          isForever: false,
          inputText: this.normalizeForDisplay(text)
        };
      }
      if (!this._endDate && s.startsWith('until ')) { // until September 1st
        const endDate = this.parseDate(withoutPrefix);
        if (endDate) {
          this._isRecurrent = true;
          this._endDate = endDate;
          return {
            pattern: { amount: Constants.DaysUntil(endDate), interval: 'day' },
            inputText: this.normalizeForDisplay(text),
            isForever: false
          };
        }
      }
      return undefined;
    }
  }

  /**
   * Handle special case where user provides only the recurrence statement,
   * like 'every Wednesday'. We must infer that it should repeat weekly.
   */
  private inferRecurrenceFromDate(everyDate: string): IRecurEvery {
    return Constants.Weekday.includes(everyDate) ? Constants.WeeklyRecurrence : Constants.YearlyRecurrence;
  }

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
        result = Constants.StartOfTomorrow(); break;
      case 'week':
        result = Constants.StartOfWeek().add(startsNext ? 1 : 0, 'week'); break;
      case 'month':
        result = Constants.StartOfMonth().add(startsNext ? 1 : 0, 'month'); break;
      case 'year':
        result = Constants.StartOfYear().add(startsNext ? 1 : 0, 'year'); break;
    }

    // Monday through Sunday
    if (!result) {
      if (Constants.Weekday.includes(s)) {
        result = Constants.NearestWeekday(s);
      }
    }

    return result;
  }

  private parseExactDate(input: string): moment.Moment {
    let s = input.trim().toLowerCase(), startsNext = false;
    if (s.startsWith('next')) {
      startsNext = true;
      s = s.slice('next'.length + 1);
    }

    for (const format of FragmentParser.Formats) {
      const parsed = moment(s, format, true);
      if (parsed.isValid() && (format !== 'x' || Math.abs(parseInt(s, 10)) >= 31)) {
        return startsNext ? parsed.add(startsNext ? 1 : 0, 'year') : parsed;
      }
    }
    return undefined;
  }

  private extractRecurrenceUnit(s: string): IRecurrenceUnit {
    const components = s.split(' ').filter(x => !!x.length);
    let amount: number;
    let interval: RecurrenceInterval;
    if (!components.length || components.length > 2) {
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

  private calculateEndDate(): number {
    if (this._endDate) {
      return this._endDate.valueOf();
    }
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

  private normalizeFragment(fragment: string): string {
    return fragment
      .replace(/\.+$/, '')  // no trailing periods
      .replace(',', '')     // no commas
      .toLowerCase();       // case-insensitive
  }

  private normalizeForDisplay(fragment: string): string {
    return fragment
      .replace(/\.+$/, '')  // no trailing periods
      .replace(/,+$/, '');  // no trailing commas
  }

  private get noDateDetected(): boolean {
    return !(this._startDate || this._recurEvery || this._recurFor);
  }
}
