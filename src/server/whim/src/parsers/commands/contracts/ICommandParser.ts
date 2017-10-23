import { IParseResult } from '../../../models/api';
export interface ICommandParser {
  parseForSearchResults(searchTerm: string, userId: string): Promise<IParseResult[]>;
}
