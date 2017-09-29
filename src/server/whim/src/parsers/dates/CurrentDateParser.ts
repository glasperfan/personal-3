import { WhimError } from '../../models';
import { DateParser as V1Parser} from './parsing/v1/parser';
import { IDateParser } from './contracts/IDateParser';

const version = 1;

export function getCurrentParser(): IDateParser {
  switch (version) {
    case 1: return new V1Parser();
    default: throw new WhimError('Invalid parser version');
  }
}

const parser = getCurrentParser();

export function parseString(s: string) {
  return parser.parseString(s);
}

export function parseArray(s: string[]) {
  return parser.parseArray(s);
}
