import { ISnippet } from '../contracts/ISnippet';
import { IEvent, WindowView } from '../../../models';
import { ParseResultWithValidator } from './ParseResult';
import { Validator } from '../../validator';
import { QueryText } from '../QueryText';

/**
 *QueryEvent result:
  **TRIGGER: [....]
  **Arguments: event
  Header: text Megan Taing good luck on LSAT
  Description: ...<b>good lu</b>ck...
  LeadsTo: ShowEvent
  Arguments: { event }
 */
export class QueryEventParseResult extends ParseResultWithValidator {

    public leadsTo = WindowView.ShowEvents;
    private _tags: string[];
    private _snippet: ISnippet;

    constructor(private _event: IEvent, private _searchComponents: string[]) {
      super();
      this.extractData();
    }

    public get header(): string {
      return this._event.title;
    }

    public get description(): string {
      return `${this._snippet && this._snippet.text}...${this.formatTags(this._tags)}`;
    }

    public get arguments(): IEvent {
      return this._event;
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
