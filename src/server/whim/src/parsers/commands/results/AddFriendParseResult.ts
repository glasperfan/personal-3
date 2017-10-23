import { DateParsingConstants } from '../../dates/parsing/DateParsingConstants';
import { DateParser } from '../../../parsers/dates';
import { IAddFriendArguments, IParsedDate, WindowView } from '../../../models';
import { Validator } from '../../../parsers/validator';
import { ParseResultWithValidator } from './ParseResult';
import * as moment from 'moment';
import { uniqBy } from 'lodash';

/**
 * AddFriend result:
  **TRIGGER: 'Add' [....] [{#}...]
  **Arguments: COMPONENTS
  Header: Add Megan Taing as a friend
  Description: Megan Taing (name), megantaing@gmail.com (email), 888-888-8888 (phone)
  LeadsTo: AddFriend page
  Arguments: { name, email, phone, tags }
 */
export class AddFriendParseResult extends ParseResultWithValidator {

  public static DateParser = new DateParser();
  public static AddKeyword = 'add';
    public static MetKeyword = 'met';

    public static validate(inputComponents: string[]): boolean {
      let keyword = inputComponents.length ? inputComponents[0] : '';
      keyword = keyword.trim().toLocaleLowerCase();
      return [this.AddKeyword, this.MetKeyword].some(k => k === keyword);
    }

    public leadsTo: WindowView = WindowView.AddFriends;
    private _firstName: string;
    private _lastName: string;
    private _email: string;
    private _phone: string;
    private _birthday: moment.Moment;
    private _firstNote: string;
    private _tags: string[] = [];

    constructor(private _components: string[]) {
      super();
      this.extractData();
    }

    public get header(): string {
      if (!this._firstName) {
        return `Add a friend`;
      }
      return `Add <b>${this._firstName}${this._lastName ? (' ' + this._lastName) : ''}</b> as a friend.`;
    }

    public get description(): string {
      if (!this._firstName) {
        return `After "add", type a first name, last name, email, phone, notes or tags.`;
      }
      let desc = `${this._firstName}${this._lastName ? (' ' + this._lastName) : ''} (name)`;
      if (this._email) {
        desc += `%%${this._email} (email)`;
      }
      if (this._phone) {
        desc += `%%${this._phone} (phone)`;
      }
      if (this._birthday) {
        desc += `%%${this._birthday.format('MMMM Do')} (birthday)`;
      }
      if (this._tags.length) {
        desc += `%%${this._tags.join(', ')} (tags)`;
      }
      return desc;
    }

    public get arguments(): IAddFriendArguments {
      return <IAddFriendArguments>{
        first: this._firstName,
        last: this._lastName,
        email: this._email,
        phone: this._phone,
        birthday: this._birthday && this._birthday.valueOf().toString(),
        firstNote: this._firstNote,
        tags: this._tags
      };
    }

    protected extractData(): void {
      // Search for phone numbers first, which can get mistaken as date timestamps.
      const componentStr = this._components.slice(1).join(' '); // remove 'add' or 'met'
      this._phone = Validator.firstPhoneNumber(componentStr);

      this._components = this._phone
        ? componentStr.replace(this._phone, '').split(' ').filter(s => !!s.length)
        : this._components.slice(1);

      for (let idx = 0; idx < this._components.length; idx++) {
        const component = this._components[idx];
        if (Validator.isTag(component)) {
          this._tags.push(component);
          continue;
        }
        if (Validator.isEmail(component) && !this._email) {
          this._email = component;
          continue;
        }

        const parsedDate = this.extractDateComponents(idx);
        const asDate = parsedDate[0];
        const numComponents = parsedDate[1];
        if (asDate && asDate.startInputText !== this._phone) {
          this._birthday = moment(asDate.startDate, 'x', true);
          idx += numComponents;
          continue;
        }

        if (!this._firstName && !Validator.isTagStart(component)) {
          this._firstName = Validator.capitalize(component);
          continue;
        }

        if (!this._lastName && !Validator.isTagStart(component) && idx === 1) {
          this._lastName = Validator.capitalize(component);
          continue;
        }

        if (!this._firstNote) {
          this._firstNote = component;
        } else {
          this._firstNote += ` ${component}`;
        }
      }

      // Remove duplicate tags
      this._tags = Array.from(new Set(this._tags));
    }

    /**
     * Parsing in reverse order of length since May 22 will match before May 22 1990
     * Returns the number of components used to successfully parse.
     */
    private extractDateComponents(idx: number): [IParsedDate, number] {
      if (this._birthday) {
        return [undefined, 0];
      }
      const startsWithDateInfo = !!DateParsingConstants.TimeKeywordLookup[this._components[idx]];
      if (startsWithDateInfo) {
        const parser = AddFriendParseResult.DateParser;
        for (let substrLen = 3; substrLen > 0; substrLen--) {
          const result = parser.parseArray(this._components.slice(idx, idx + substrLen));
          if (result) {
            return [result, substrLen];
          }
        }
      }
      return [undefined, 0];
    }
  }
