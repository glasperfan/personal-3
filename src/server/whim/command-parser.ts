import { CalendarManager } from './calendar-mgr';
import { FriendManager } from './friend-mgr';
import { Validator } from './validator';
import {
    IAddFriendArguments,
    IEvent,
    IEventDate,
    IFriend,
    IName,
    IParseResult,
    IParseSearchArguments,
    WhimError,
    WindowView,
    INote,
    Birthday,
} from './models';
import { DatabaseManager } from './database-mgr';
import * as moment from 'moment-timezone';
import * as MongoDB from 'mongodb';

export class CommandParser {

  private static FriendQueryIndexes: string[] = [
    'email',
    'phone',
    'address.address1',
    'address.city',
    'address.state',
    'address.country',
    'tags',
    'methods',
    'notes.text'
  ];
  private resultsCache: { [userId: string]: IParseResult[] };

  constructor(
    private db: DatabaseManager,
    private friendMgr: FriendManager,
    private calendarMgr: CalendarManager) { }

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
    ]).then((collections: MongoDB.Collection[]) => Promise.all([
      this.searchByText<IFriend>(collections[0], searchComponents),
      this.searchByText<IEvent>(collections[1], searchComponents)
    ])).then(aggregateResults => {
      results = results.concat(aggregateResults[0].map(f =>
        new QueryFriendParseResult(f, searchComponents).AsResult()));
      results = results.concat(aggregateResults[1].map(e =>
        new QueryEventParseResult(e, searchComponents).AsResult()));
      return Promise.resolve(results);
      }).catch(err => {
        return Promise.reject(err);
      });
  }

  private searchByText<T>(collection: MongoDB.Collection<T>, components: string[]): Promise<T[]> {
    return collection.find({ '$text': { '$search': components.join(' ') } })
      .toArray()
      .catch(e => {
        console.log(e);
        return [];
      });
  }
}

interface ISnippet {
  field: string;
  text: string;
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

  protected addToSnippet(currentSnippet: ISnippet, snippet: ISnippet, snippetRegex: RegExp): ISnippet {
    if (!currentSnippet || !currentSnippet) {
      return this.formatSnippet(snippet, snippetRegex);
    }
    const match = snippetRegex.exec(currentSnippet.text);
    currentSnippet.text = currentSnippet.text.replace(match[0], `<b>${match[0]}</b>`);
    return currentSnippet;
  }

  protected formatSnippet(snippet: ISnippet, snippetRegex: RegExp): ISnippet {
    const match = snippetRegex.exec(snippet.text);
    const bolded = snippet.text.replace(match[0], `<b>${match[0]}</b>`);
    return { text: `${bolded} <i>(${snippet.field})</i>`, field: snippet.field };
  }

  protected formatTags(tags: string[]) {
    return (!!tags && !!tags.length) ? ' ' + tags.map(t => `<b>${t}</b>`).join(' ') : '';
  }

  private splice(str: string, start: number, delCount: number, newSubStr: string): string {
      return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
  };
}

export class AddFriendParseResult extends ParseResultWithValidator {

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
      const asDate = Validator.parseDate(this._components.slice(idx + 1, idx + 4).join(' '))
        || Validator.parseDate(this._components.slice(idx + 1, idx + 3).join(' '))
        || Validator.parseDate(component);
      if (Validator.isTag(component)) {
        this._tags.push(component);
      } else if (Validator.isEmail(component) && !this._email) {
        this._email = component;
      } else if (Validator.isPhoneNumber(component) && !this._phone) {
        this._phone = component;
      } else if (asDate && asDate.isValid()) {
        this._birthday = new Birthday(asDate);
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
      date: this._date,
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
            baseDate: parsedDate.valueOf()
          };
          toSkip = idx;
          return;
        }
      } else if (component === AddEventParseResult.RecurrentKeyword) {
        const parsedDate = Validator.parseDate(this._components.slice(idx + 1).join(' '));
        if (parsedDate) {
          this._date = {
            recurrent: true,
            baseDate: parsedDate.valueOf(),
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
  private _snippet: ISnippet;
  private _tags: string[] = [];

  constructor(private _friend: IFriend, private _searchComponents: string[]) {
    super();
    this.extractData();
  }

  public get header(): string {
    return this._friend.name.displayName;
  }

  public get description(): string {
    let desc = (this._snippet && this._snippet.text) || '';
    if (this._tags && this._tags.length && this._snippet) {
      desc += '...';
    }
    if (this._tags && this._tags.length) {
      desc += this.formatTags(this._tags);
    }
    return desc;
  }

  public get arguments(): any {
    return { friend: this._friend };
  }

  protected extractData(): void {
    const snippets = QueryText.ParseFriend(this._friend);
    for (const component of this._searchComponents) {
      const regexComponent = new RegExp(component, 'i');
      if (Validator.isTag(component) && this._friend.tags.includes(component)) {
        this._tags.push(component);
      }
      // For now support the first matching snippet
      for (const s of snippets) {
        if (s.text && regexComponent.test(s.text)) {
          if (!this._snippet) {
            this._snippet = this.formatSnippet(s, regexComponent);
          } else if (this._snippet && this._snippet.field === s.field) {
            this.addToSnippet(this._snippet, s, regexComponent);
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
      const regexComponent = new RegExp(component, 'i');
      if (Validator.isTag(component)) {
        if (!this._tags) {
          this._tags = [];
        }
        this._tags.push(component);
      }
      // For now support the first matching snippet
      if (!this._snippet) {
        for (const s of snippets) {
          if (s.text && regexComponent.test(s.text)) {
            this._snippet = this.formatSnippet(s, regexComponent);
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
      { text: f.name.displayName, field: 'name' },
      { text: f.birthday && f.birthday.birthdate, field: 'birthday' },
      { text: f.email, field: 'email' },
      { text: f.phone, field: 'phone' },
      { text: f.address && f.address.city, field: 'location' },
      { text: f.organization, field: 'organization' },
      { text: f.skills && f.skills.join(', '), field: 'skills' },
      { text: (f.notes || []).map(note => note.text).join(' '), field: 'notes' }
    ].map(s => this.Normalize(s));
  }

  public static ParseEvent(e: IEvent): ISnippet[] {
    const baseDateMoment = Validator.parseDate(e.date && e.date.baseDate && e.date.baseDate.toString());
    return [
      { text: e.title, field: 'title' },
      { text: baseDateMoment && baseDateMoment.format('MMMM D, YYYY'), field: 'date' },
      { text: e.description, field: 'description' },
      { text: e.relatedFriends && e.relatedFriends.join(', '), field: 'tagged friends' },
    ].map(s => this.Normalize(s));
  }

  private static Normalize(s: ISnippet): ISnippet {
    s.text = s.text && s.text.trim();
    return s;
  }
}
