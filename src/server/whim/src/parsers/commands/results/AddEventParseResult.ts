import { DateParser } from '../../dates';
import { splice } from '../splice';
import { ParseResultWithValidator } from './ParseResult';
import { IParsedDate, WindowView } from '../../../models';
import { Validator } from '../../validator';
import * as moment from 'moment';

/**
 * AddEvent result:
  **TRIGGER: [....] on [date] [{#}...], [....] every [date] [{#}...]
  **Arguments: COMPONENTS
  Header: text Megan Taing good luck on LSAT
  Description: September 19 (one-time)
  LeadsTo: AddEvent page
  Arguments: { title, date, friends, tags }
 */
export class AddEventParseResult extends ParseResultWithValidator {
  public static DateParser = new DateParser();
  public static OnceDateKeyword = 'on';
  public static RecurrentKeyword = 'every';
  public static Keywords = [
    AddEventParseResult.OnceDateKeyword,
    AddEventParseResult.RecurrentKeyword,
    'today',
    'tomorrow',
    'next week'
  ];

  public static validate(inputComponents: string[]): boolean {
    for (const keyword in this.Keywords) {
      if (keyword in inputComponents) {
        return true;
      }
    }
    return false;
  }

  public leadsTo: WindowView = WindowView.AddEvents;
  private _date: IParsedDate;
  private _title = '';
  private _tags: string[] = [];

  constructor(private _components: string[]) {
    super();
    this.extractData();
  }

  public get header(): string {
    return Validator.capitalize(this._title);
  }

  public get description(): string {
    let desc: string;
    if (this._date) {
      const formattedDate = moment(this._date.startDate).format('MMMM D, YYYY');
      desc = `${formattedDate} (date)`;
      if (this._date.recurrence.isRecurrent) {
        desc += `\nRecurs <i>${this._date.recurrence.recurEvery.inputText}</i>`;
        desc += this._date.recurrence.recurFor.isForever ?
          ', forever' :
          (this._date.recurrence.recurFor.inputText || '');
      }
    }
    if (this._tags && this._tags.length) {
      desc += ` ${this._tags.join(', ')} (tags)`;
    }
    if (!desc) {
      desc = 'Use the keywords "at" or "on" for one-time events, and "every" for recurring events.';
    }
    return desc;
  }

  public get arguments(): any {
    return {
      title: this._title,
      date: this._date,
      tags: this._tags
    };
  };

  protected extractData(): void {
    while (!!this._components.length) {
      const component = this._components[0];
      if (this.extractTag(component)) {
        this._components.shift();
        continue;
      }
      if (this.extractDateComponents(this._components)) {
        this.removeDateComponents();
        continue;
      }
      this.extractDescription(component);
      this._components.shift();
    }
  }

  private extractTag(term: string): boolean {
    const match: boolean = Validator.isTag(term);
    if (match) {
      this._tags.push(term);
    }
    return match;
  }

  private extractDescription(term: string): boolean {
    const match: boolean = !Validator.isTagStart(term);
    if (match) {
        this._title += ` ${term}`;
    }
    return match;
  }

  private extractDateComponents(components: string[]): boolean {
    let dateFound = false;
    if (!this._date) {
      const parsed = AddEventParseResult.DateParser.parseArray(components);
      dateFound = parsed !== undefined;
      if (dateFound) {
        this._date = parsed;
      }
    }
    return dateFound;
  }

  private removeDateComponents(): void {
    let s = this._components.join(' ').trim();
    const inputTexts = [
      this._date.startInputText,
      this._date.recurrence.recurEvery.inputText,
      this._date.recurrence.recurFor.inputText
    ].filter(x => x && x.length);
    inputTexts.forEach(inputText => {
      s = s.replace(inputText, '').trim();
    });
    this._components = s.split(' ').filter(c => !!c.length);
  }
}
