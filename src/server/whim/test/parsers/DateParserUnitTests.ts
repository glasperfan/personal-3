import { DateParsingConstants as Constants } from '../../src/parsers/dates/parsing/DateParsingConstants';
import { IParsedDate } from '../../src/models';
import { DateParser } from '../../src/parsers/dates/parsing/v1/parser';
import 'mocha';
import { expect } from 'chai';
import * as moment from 'moment';

type DateInput = moment.Moment | { text: string, format: string };

describe('Date parsers', () => {
  describe('V1 Date Parser', () => {
    let v1Parser: DateParser;

    beforeEach(() => {
      v1Parser = new DateParser();
    });

    it(`case 1`, () => {
      const result = v1Parser.parseString(`John's birthday on September 7th`);
      Utils.testOneTimeDate(result, { text: 'September 7th', format: 'MMMM Do' }, 'on September 7th');
    });

    it(`case 2`, () => {
      const result = v1Parser.parseString(`Maggie is going to NYC on Sunday`);
      Utils.testOneTimeDate(result, { text: 'Sunday', format: 'dddd' }, 'on Sunday');
    });

    it(`case 3`, () => {
      const result = v1Parser.parseArray(['Maggie', 'is', 'going to', 'NYC on', 'Sunday']);
      Utils.testOneTimeDate(result, { text: 'Sunday', format: 'dddd' }, 'on Sunday');
    });

    it('case 4', () => {
      const result = v1Parser.parseString('Joe will be doing something starting tomorrow');
      Utils.testRecurrentDate(result, Constants.StartOfTomorrow(), 'starting tomorrow');
    });
  });
});

class Utils {
  static testOneTimeDate(result: IParsedDate, date: DateInput, startInputText: string, isRecurrent = false) {
    expect(result).to.not.be.null;
    expect(result.startDate).to.equal(moment.isMoment(date) ? date.valueOf() : moment((<any>date).text, (<any>date).format).valueOf());
    expect(result.recurrence.isRecurrent).to.equal(isRecurrent);
    expect(result.startInputText).to.equal(startInputText);
  }

  static testRecurrentDate(result: IParsedDate, date: DateInput, startInputText: string) {
    this.testOneTimeDate(result, date, startInputText, true);
  }
}
