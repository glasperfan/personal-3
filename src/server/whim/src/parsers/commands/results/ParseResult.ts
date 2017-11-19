import { ISnippet } from '../contracts/ISnippet';
import { IParseResult, WindowView } from '../../../models';

export abstract class ParseResultWithValidator implements IParseResult {
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
    if (match && match[0]) { // to Boston => to Bos<b>to</b>n => "Boston" doesn't match now
      currentSnippet.text = currentSnippet.text.replace(match[0], `<b>${match[0]}</b>`);
    } else {
      console.log(`Edge case in regex`, snippetRegex.source, currentSnippet, match);
    }
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
