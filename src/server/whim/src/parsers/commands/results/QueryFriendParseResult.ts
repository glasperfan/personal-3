import { ISnippet } from '../contracts/ISnippet';
import { IFriend, WindowView } from '../../../models';
import { ParseResultWithValidator } from './ParseResult';
import { Validator } from '../../validator';
import { QueryText } from '../QueryText';

/**
 * QueryFriend result:
  **TRIGGER: [{location, skills, methods}....]
  **Arguments: friend
  Header: Megan Taing
  Description: ...Location: <b>NYC</b>...
  LeadsTo: ShowFriend
  Arguments: { friend }
 */
export class QueryFriendParseResult extends ParseResultWithValidator {
  public leadsTo = WindowView.ShowFriends;
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

  public get arguments(): IFriend {
    return this._friend;
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
