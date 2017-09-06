import { CalendarManager } from './calendar-mgr';
import { FriendManager } from './friend-mgr';
import { Validator } from './validator';
import {
  IEventDate,
  IName,
  IParseResult,
  IParseSearchArguments,
  WhimError,
  WindowView,
  IFriend,
  IEvent
} from './models';
import { DatabaseManager } from './database-mgr';
import * as moment from 'moment-timezone';
import * as MongoDB from 'mongodb';

export class CommandParser {

  private static FriendQueryIndexes: string[] = [
    'email',
    'phone',
    'location',
    'tags',
    'methods'
  ];
  private resultsCache: { [userId: string]: IParseResult[] };

  constructor(
    private db: DatabaseManager,
    private friendMgr: FriendManager,
    private calendarMgr: CalendarManager) { }

  // "-----" => we want to check against all queryable text from each friend
  // A few special commands:
  // Add [first] [last] [phone number?] [email?] [tags]
  //
  // Types of search results
  // Limit to 10 results
  public parseForSearchResults(searchTerm: string, userId: string): Promise<IParseResult[]> {
    if (!searchTerm || !searchTerm.length || !userId) {
      throw new WhimError('A search term and userId is required');
    }
    // Parse search string into components
    const searchComponents: string[] = searchTerm.trim().split(' ');

    // Add friend/event results
    let results: IParseResult[] = [];
    if (AddFriendParseResult.validate(searchComponents)) {
      results = results.concat(new AddFriendParseResult(searchComponents).AsResult());
    }
    if (AddEventParseResult.validate(searchComponents)) {
      results = results.concat(new AddEventParseResult(searchComponents).AsResult());
    }

    return Promise.all([
      this.friendMgr.getUserFriendCollection(userId),
      this.calendarMgr.getUserEventCollection(userId)
    ]).then(collections => Promise.all([
      this.searchByText<IFriend>(collections[0], searchComponents),
      this.searchByText<IEvent>(collections[1], searchComponents)
    ])).then(aggregateResults => {
      results = results.concat(aggregateResults[0].map(f =>
        new QueryFriendParseResult(f, searchComponents).AsResult()));
      results = results.concat(aggregateResults[1].map(e =>
        new QueryEventParseResult(e, searchComponents).AsResult()));
      return Promise.resolve(results);
    });
  }

  private searchByTag<T>(collection: MongoDB.Collection<T>, tags: string[]): Promise<T[]> {
    return Promise.resolve([]); /* TODO */
  }

  private searchByText<T>(collection: MongoDB.Collection<T>, components: string[]): Promise<T[]> {
    return Promise.resolve([]); /* TODO */
  }
}

enum QueryIntent {
  Skill = 'skill',
  Location = 'location',
  Tag = 'tag'
}

interface ISnippet {
  snippet: string;
  field: string;
}

/*

AddFriend result:
  **TRIGGER: 'Add' [....] [{#}...]
  **Arguments: COMPONENTS
  Header: Add Megan Taing as a friend
  Description: Megan Taing (name), megantaing@gmail.com (email), 888-888-8888 (phone)
  LeadsTo: AddFriend page
  Arguments: { name, email, phone, tags }

AddEvent result:
  **TRIGGER: [....] on [date] [{#}...], [....] every [date] [{#}...]
  **Arguments: COMPONENTS
  Header: text Megan Taing good luck on LSAT
  Description: September 19 (one-time)
  LeadsTo: AddEvent page
  Arguments: { title, date, friends, tags }

TagFriend result:
  **TRIGGER: [....] [{#}...] [{#}...]
  **Arguments: friend
  Header: Megan Taing
  Description: #LSAT #NYC
  LeadsTo: ShowFriend
  Arguments: { friend }

TagEvent result:
  **TRIGGER: [....] [{#}...] [{#}...]
  **Arguments: event
  Header: text Megan Taing good luck on LSAT (September 19, one-time)
  Description: #LSAT #NYC
  LeadsTo: ShowEvent
  Arguments: { event }

QueryFriend result:
  **TRIGGER: [{location, skills, methods}....]
  **Arguments: friend
  Header: Megan Taing
  Description: ...Location: <b>NYC</b>...
  LeadsTo: ShowFriend
  Arguments: { friend }

QueryEvent result:
  **TRIGGER: [....]
  **Arguments: event
  Header: text Megan Taing good luck on LSAT
  Description: ...<b>good lu</b>ck...
  LeadsTo: ShowEvent
  Arguments: { event }
*/
abstract class ParseResultWithValidator implements IParseResult {
  public static TagStartKeyword = '#';

  public static validate(inputComponents: string[]): boolean {
    return !!inputComponents.length;
  }

  public abstract header: string;
  public abstract description: string;
  public abstract leadsTo: WindowView;
  public abstract arguments: any;

  public AsResult(): IParseResult {
    return {
      header: this.header,
      description: this.description,
      leadsTo: this.leadsTo,
      arguments: this.arguments
    };
  }

  protected abstract extractData(): void;

  protected formatSnippet(snippet: ISnippet, match: string): string {
    const bolded = snippet.snippet.replace(match, `<b>${match}</b>`);
    return `${bolded} <i>(${snippet.field})</i>`;
  }

  protected formatTags(tags: string[]) {
    return (!!tags && !!tags.length) ? ' ' + tags.map(t => `<b>${t}</b>`).join(' ') : '';
  }
}

export class AddFriendParseResult extends ParseResultWithValidator {

  public static AddKeyword = 'add';

  public static validate(inputComponents: string[]): boolean {
    return inputComponents[0] === this.AddKeyword;
  }

  public leadsTo: WindowView = WindowView.AddFriends;
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _phone: string;
  private _notes: string;
  private _tags: string[];

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
      desc += ` ${this._email} (email)`;
    }
    if (this._phone) {
      desc += ` ${this._phone} (phone)`;
    }
    if (this._tags) {
      desc += ` ${this._tags.join(', ')} (tags)`;
    }
    return desc;
  }

  public get arguments(): any {
    return {
      name: {
        first: this._firstName,
        last: this._lastName
      },
      email: this._email,
      phone: this._phone,
      notes: this._notes,
      tags: this._tags
    };
  }

  protected extractData(): void {
    for (const component of this._components.slice(1)) {
      if (Validator.isTag(component)) {
        if (!this._tags) {
          this._tags = [];
        }
        this._tags.push(component);
      } else if (Validator.isEmail(component) && !this._email) {
        this._email = component;
      } else if (Validator.isPhoneNumber(component) && !this._phone) {
        this._phone = component;
      } else if (!this._firstName && !Validator.isTagStart(component)) {
        this._firstName = Validator.capitalize(component);
      } else if (!this._lastName && !Validator.isTagStart(component)) {
        this._lastName = Validator.capitalize(component);
      } else {
        if (!this._notes) {
          this._notes = component;
        } else {
          this._notes += ` ${component}`;
        }
      }
    }
  }
}

export class AddEventParseResult extends ParseResultWithValidator {

  public static OnceDateKeyword = 'on';
  public static OnceTimeKeyword = 'at';
  public static RecurrentKeyword = 'every';

  public static validate(inputComponents: string[]): boolean {
    const onMatch = inputComponents.lastIndexOf(this.OnceDateKeyword);
    const atMatch = inputComponents.lastIndexOf(this.OnceTimeKeyword);
    const everyMatch = inputComponents.lastIndexOf(this.RecurrentKeyword);
    return [onMatch, atMatch, everyMatch]
      .some(keywordIdx => keywordIdx > 0 && keywordIdx < inputComponents.length - 1);
  }

  public leadsTo: WindowView = WindowView.AddEvents;
  private _date: IEventDate;
  private _title: string;
  private _tags: string[];

  constructor(private _components: string[]) {
    super();
    this.extractData();
  }

  public get header(): string {
    return Validator.capitalize(this._title);
  }

  public get description(): string {
    let desc = 'Use the keywords "at" or "on" for one-time events, and "every" for recurring events.';
    if (this._date) {
      const formattedDate = moment(this._date.baseDate)
        .tz(moment.tz.guess())
        .format('MMMM D, YYYY hh:mm a z');
      desc = `${formattedDate} (date)`;
    }
    if (this._tags) {
      desc += ` ${this._tags.join(', ')} (tags)`;
    }
    return desc;
  }

  public get arguments(): any {
    return {
      title: this._title,
      nextDate: this._date,
      tags: this._tags
    };
  };

  protected extractData(): void {
    let toSkip = 0;
    this._components.forEach((component, idx) => {
      if (toSkip > 0) {
        --toSkip;
        return;
      }
      if (Validator.isTag(component)) {
        if (!this._tags) {
          this._tags = [];
        }
        this._tags.push(component);
      } else if (component === AddEventParseResult.OnceTimeKeyword ||
        component === AddEventParseResult.OnceDateKeyword) {
        const parsedDate = Validator.parseDate(this._components.slice(idx + 1).join(' '));
        if (parsedDate) {
          this._date = {
            recurrent: false,
            baseDate: parsedDate.toDate().getTime()
          };
          toSkip = idx;
          return;
        }
      } else if (component === AddEventParseResult.RecurrentKeyword) {
        const parsedDate = Validator.parseDate(this._components.slice(idx + 1).join(' '));
        if (parsedDate) {
          this._date = {
            recurrent: true,
            baseDate: parsedDate.toDate().getTime(),
            recurrenceOffset: 'week'
          };
          toSkip = idx;
          return;
        }
      }
      if (!Validator.isTagStart(component)) {
        if (!this._title) {
          this._title = component;
        } else {
          this._title += ` ${component}`;
        }
      }
    });
  }
}

export class QueryFriendParseResult extends ParseResultWithValidator {
  public leadsTo: WindowView;
  private _snippet: string;
  private _tags: string[];

  constructor(private _friend: IFriend, private _searchComponents: string[]) {
    super();
    this.extractData();
  }

  public get header(): string {
    return `${this._friend.first} ${this._friend.last}`;
  }

  public get description(): string {
    return `${this._snippet}...${this.formatTags(this._tags)}`;
  }

  public get arguments(): any {
    return { friend: this._friend };
  }

  protected extractData(): void {
    const snippets = QueryText.ParseFriend(this._friend);
    for (const component of this._searchComponents) {
      if (Validator.isTag(component)) {
        if (!this._tags) {
          this._tags = [];
        }
        this._tags.push(component);
      }
      // For now support the first matching snippet
      if (!this._snippet) {
        for (const snippet of snippets) {
          if (snippet.snippet.includes(component)) {
            this._snippet = this.formatSnippet(snippet, component);
          }
        }
      }
    }
  }
}

export class QueryEventParseResult extends ParseResultWithValidator {

  public leadsTo: WindowView;
  private _tags: string[];
  private _snippet: string;

  constructor(private _event: IEvent, private _searchComponents: string[]) {
    super();
    this.extractData();
  }

  public get header(): string {
    return this._event.title;
  }

  public get description(): string {
    return `${this._snippet}...${this.formatTags(this._tags)}`;
  }

  public get arguments(): any {
    return { event: this._event };
  }

  protected extractData(): void {
    const snippets = QueryText.ParseEvent(this._event);
    for (const component of this._searchComponents) {
      if (Validator.isTag(component)) {
        if (!this._tags) {
          this._tags = [];
        }
        this._tags.push(component);
      }
      // For now support the first matching snippet
      if (!this._snippet) {
        for (const snippet of snippets) {
          if (snippet.snippet.includes(component)) {
            this._snippet = this.formatSnippet(snippet, component);
          }
        }
      }
    }
  }
}

class QueryText {
  /* TODO: implement caching system */

  public static ParseFriend(f: IFriend): ISnippet[] {
    return [
      { snippet: `${f.first} ${f.last}`, field: 'name' },
      { snippet: moment(f.birthday).format('MMMM D, YYYY'), field: 'birthday' },
      { snippet: f.email, field: 'email' },
      { snippet: f.phone, field: 'phone' },
      { snippet: `${f.location.city}`, field: 'location' },
      { snippet: f.organization, field: 'organization' },
      { snippet: f.skills.join(', '), field: 'skills' },
      { snippet: f.notes, field: 'notes' }
    ].map(s => this.Normalize(s));
  }

  public static ParseEvent(e: IEvent): ISnippet[] {
    return [
      { snippet: e.title, field: 'title' },
      { snippet: moment(e.nextDate.baseDate).format('MMMM D, YYYY'), field: 'date' },
      { snippet: e.description, field: 'description' },
      { snippet: e.relatedFriends.join(', '), field: 'tagged friends' },
    ].map(s => this.Normalize(s));
  }

  private static Normalize(s: ISnippet): ISnippet {
    s.snippet = s.snippet.trim().toLocaleLowerCase();
    return s;
  }
}

