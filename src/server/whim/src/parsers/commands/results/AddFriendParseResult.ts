import { IParsedDate } from '../../../models/date';
import { DateParser } from '../../../parsers/dates';
import { Birthday, IAddFriendArguments, WindowView } from '../../../models';
import { Validator } from '../../../parsers/validator';
import { ParseResultWithValidator } from './ParseResult';
import * as moment from 'moment';

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
      const keyword = inputComponents[0].trim().toLocaleLowerCase();
      return [this.AddKeyword, this.MetKeyword].some(k => k === keyword);
    }

    public leadsTo: WindowView = WindowView.AddFriends;
    private _firstName: string;
    private _lastName: string;
    private _email: string;
    private _phone: string;
    private _birthday: Birthday;
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
        desc += `%%${this._birthday.birthdate} (birthday)`;
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
        birthday: this._birthday && this._birthday.birthdate,
        firstNote: this._firstNote,
        tags: this._tags
      };
    }

    protected extractData(): void {
      let toSkip = 0;
      this._components.slice(1).forEach((component, idx) => {
        if (toSkip > 0) {
          --toSkip;
          return;
        }
        // Parsing in reverse order of length since May 22 will match before May 22 1990
        const asDate = this.extractDateComponents(idx);
        if (Validator.isTag(component)) {
          this._tags.push(component);
        } else if (Validator.isEmail(component) && !this._email) {
          this._email = component;
        } else if (Validator.isPhoneNumber(component) && !this._phone) {
          this._phone = component;
        } else if (asDate) {
          this._birthday = new Birthday(moment(asDate.startDate, 'x'));
          toSkip = (<any>asDate)._i.split(' ').length - 1;
        } else if (!this._firstName && !Validator.isTagStart(component)) {
          this._firstName = Validator.capitalize(component);
        } else if (!this._lastName && !Validator.isTagStart(component)) {
          this._lastName = Validator.capitalize(component);
        } else {
          if (!this._firstNote) {
            this._firstNote = component;
          } else {
            this._firstNote += ` ${component}`;
          }
        }
      });
    }

    private extractDateComponents(idx: number): IParsedDate {
      const parser = AddFriendParseResult.DateParser;
      if (this._birthday) {
        return undefined;
      }
      return parser.parseArray(this._components.slice(idx + 1, idx + 4))
      || parser.parseArray(this._components.slice(idx + 1, idx + 3))
      || parser.parseString(this._components[idx]);
    }
  }
