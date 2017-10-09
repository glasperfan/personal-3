import { splice } from '../../../commands/splice';
import { IDateParser } from '../../contracts/IDateParser';
import { IParsedDate, IRecurEvery, IRecurFor, IRecurrenceUnit, RecurrenceInterval } from '../../../../models';
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
  private static keywords = ['for', 'every', 'starting', 'on', 'is'];
  private static minorKeywords = ['next', 'this'];
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
    const words = sentence.replace(',', '').split(' ');
    for (const word of words) {
      const lc = word.toLowerCase();
      if (DateParser.keywords.includes(lc)) { // start of fragment
        if (currentFragment.length) {
          fragments = fragments.concat(this.explode(currentFragment));
        }
        currentFragment = [word];
      } else if (currentFragment.length) { // continuation of fragment
        currentFragment.push(word);
      } else if (DateParser.minorKeywords.includes(lc)) {
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

    // Normalize
    fragments = fragments.map(f => {
      f = f.replace(/\.+$/, ''); // no trailing periods
      return f.replace(',', ''); // no commas
    });

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
      const keyword = fragment.split(' ')[0];
      switch (keyword) {
        case 'every':
          if (!this._recurEvery) {
            this._recurEvery = this.extractRecurEveryComponents(fragment);
          }
          break;
        case 'for':
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
    if (!this._startDate && (this._recurEvery || this._recurFor)) {
      this._startDate = Constants.StartOfToday();
    }

    if (this._isRecurrent && (!this._recurEvery || !this._recurFor)) {
      this._recurEvery = this._recurEvery || this.DefaultRecurrence;
      this._recurFor = this._recurFor || this.DefaultDuration;
    }

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
    const s = text.toLowerCase();
    this._isRecurrent = s.startsWith('starting ');
    const withoutPrefix = s.replace(/\bstarting \b|\bon \b|\bis \b/, '');
    const startDate = this.parseDate(withoutPrefix);
    this._startInputText = startDate ? text : undefined;
    return startDate;
  }

  /** 'every [interval]', 'every other [interval]' */
  private extractRecurEveryComponents(text: string): IRecurEvery {
    const s = text.toLowerCase();
    const everySomething = s.startsWith('every ');
    this._isRecurrent = this._isRecurrent || everySomething;

    // default recurrence: 'every day'
    if (!everySomething && this._isRecurrent) {
      return this.DefaultRecurrence;
    } else if (!everySomething) {
      return this.NoRecurrence;
    } else {
      let withoutPrefix = s.replace('every ', '');
      this._isAlternating = s.includes('other ');
      if (this._isAlternating) {
        withoutPrefix = withoutPrefix.replace('other ', '');
      }
      const pattern = this.extractRecurrenceUnit(withoutPrefix);
      return pattern ? {
        pattern: pattern,
        isAlternating: this._isAlternating,
        inputText: text
      } : this.NoRecurrence;
    }
  }

  /** 'forever', 'for [duration]' */
  private extractRecurForComponents(text: string): IRecurFor {
    const s = text.toLowerCase();
    if (s === 'forever') {
      const duration = this.DefaultDuration; // forever
      duration.inputText = s;
      return duration;
    }

    const forSomething = s.startsWith('for ');

    if (!forSomething && this._isRecurrent) {
      return this.DefaultDuration;
    } else if (!forSomething) {
      return this.NoDuration;
    } else {
      const withoutPrefix = s.replace('for ', '');
      const pattern = this.extractRecurrenceUnit(withoutPrefix);
      return pattern ? {
        pattern: pattern,
        isForever: false,
        inputText: text
      } : this.NoDuration;
    }
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
      if (Constants.Weekday.includes(s)) {
        result = Constants.NearestWeekday(s);
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

    for (const format of FragmentParser.Formats) {
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

  private get noDateDetected(): boolean {
    return !(this._startDate || this._recurEvery || this._recurFor);
  }

  private get DefaultRecurrence(): IRecurEvery {
    return {
      pattern: {
        amount: 1,
        interval: 'day'
      },
      inputText: undefined,
      isAlternating: false
    };
  }

  private get NoRecurrence(): IRecurEvery {
    return {
      pattern: undefined,
      isAlternating: false,
      inputText: undefined
    };
  }

  private get DefaultDuration(): IRecurFor {
    return {
      pattern: undefined,
      isForever: true,
      inputText: undefined
    };
  }

  private get NoDuration(): IRecurFor {
    return {
      pattern: undefined,
      isForever: false,
      inputText: undefined
    };
  }
}
