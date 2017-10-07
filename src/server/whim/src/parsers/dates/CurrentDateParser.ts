import { WhimError, IParsedDate } from '../../models';
import { DateParser as V1Parser} from './parsing/v1/parser';
import { IDateParser } from './contracts/IDateParser';

const version = 1;

export function getCurrentParser(): IDateParser {
  switch (version) {
    case 1: return new V1Parser();
    default: throw new WhimError('Invalid parser version');
  }
}

export function parseString(s: string): IParsedDate {
  return getCurrentParser().parseString(s);
}

export function parseArray(s: string[]): IParsedDate {
  return getCurrentParser().parseArray(s);
}
