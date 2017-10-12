import { DateParsingConstants as Constants } from '../../src/parsers/dates/parsing/DateParsingConstants';
import { IParsedDate } from '../../src/models';
import { DateParser } from '../../src/parsers/dates/parsing/v1/parser';
import 'mocha';
import { expect } from 'chai';
import * as moment from 'moment';

describe('Date parsers', () => {
  describe('V1 Date Parser', () => {
    let v1Parser: DateParser;

    beforeEach(() => {
      v1Parser = new DateParser();
    });

    it('on September 7th', () => {
      const result = v1Parser.parseString(`John's birthday on September 7th`);
      Utils.testOneTimeDate(result, moment('September 7th', 'MMMM Do'), 'on September 7th');
    });

    it('on Monday', () => {
      const result = v1Parser.parseString(`Maggie is going to NYC on Monday`);
      Utils.testOneTimeDate(result, Constants.NearestWeekday('monday'), 'on Monday');
    });

    it('on Sunday, parsed as array', () => {
      const result = v1Parser.parseArray(['Maggie', 'is', 'going to', 'NYC on', 'Sunday']);
      Utils.testOneTimeDate(result, Constants.NearestWeekday('sunday'), 'on Sunday');
    });

    it('tomorrow', () => {
      const result = v1Parser.parseString('Joe has a party tomorrow');
      Utils.testOneTimeDate(result, Constants.StartOfTomorrow(), 'tomorrow');
    });

    it('is tomorrow', () => {
      const result = v1Parser.parseString('That is something that is tomorrow');
      Utils.testOneTimeDate(result, Constants.StartOfTomorrow(), 'is tomorrow');
    });

    it('starting tomorrow', () => {
      const result = v1Parser.parseString('Joe is starting something starting tomorrow');
      Utils.testRecurrentDate(result, Constants.StartOfTomorrow(), 'starting tomorrow');
    });

    it('starting Monday', () => {
      const result = v1Parser.parseString('Starting Monday, I will be working at Goldman Sachs');
      Utils.testRecurrentDate(result, Constants.NearestWeekday('monday'), 'Starting Monday');
    });

    it('starting Friday', () => {
      const result = v1Parser.parseString(`I'll be visiting her frequently starting Friday.`);
      Utils.testRecurrentDate(result, Constants.NearestWeekday('friday'), 'starting Friday');
    });

    it('is this week', () => {
      const result = v1Parser.parseString(`All of his research is this week.`);
      Utils.testOneTimeDate(result, Constants.StartOfWeek(), 'is this week');
    });

    it('next week', () => {
      const result = v1Parser.parseString('That is next week, when he moves into his new office.');
      Utils.testOneTimeDate(result, Constants.StartOfNextWeek(), 'is next week');
    });

    it('next tuesday', () => {
      const result = v1Parser.parseString(`Meet up with Jared next tuesday when he's in town.`);
      Utils.testOneTimeDate(
        result,
        Constants.NearestWeekday('tuesday', Constants.StartOfNextWeek()),
        'next tuesday'
      );
    });

    it('everyday', () => {
      const result = v1Parser.parseString('Start reminding me everyday.');
      Utils.testRecurrentDate(
        result,
        Constants.StartOfToday(),
        undefined
      );
    });

    it('every day', () => {
      const result = v1Parser.parseString('Every day check in with Jack and Jill while they are climbing.');
      Utils.testRecurrentDate(
        result,
        Constants.StartOfToday(),
        undefined
      );
    });

    it('every Wednesday', () => {
      const result = v1Parser.parseString('Make sure to text Ana every Wednesday.');
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('wednesday'),
        undefined
      );
    });

    it('every other Thursday', () => {
      const result = v1Parser.parseString('Check in with Charles every other Thursday at least.');
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('thursday'),
        undefined
      );
    });

    it('on August 25, 2018', () => {
      const result = v1Parser.parseString('Plan to be there on August 25, 2018.');
      Utils.testOneTimeDate(
        result,
        moment('August 25, 2018', 'MMMM D, YYYY'),
        'on August 25, 2018'
      );
    });

    it('starting Tuesday every week', () => {
      const result = v1Parser.parseString(`I'll be going to the cafe starting Tuesday every week.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Tuesday'),
        'starting Tuesday'
      );
    });

    it('starting Wednesday every week for 2 weeks', () => {
      const result = v1Parser.parseString(`I'll be going for coffee starting Wednesday every week for 2 weeks.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Wednesday'),
        'starting Wednesday'
      );
    });

    it('starting Thursday every day for 2 months', () => {
      const result = v1Parser.parseString(`Patrick will be teaching yoga for everyone in the office starting Thursday every day for 2 months.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Thursday'),
        'starting Thursday'
      );
    });

    it('every Friday for 2 days', () => {
      const result = v1Parser.parseString(`I should follow up every Friday for 2 days...`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Friday'),
        undefined
      );
    });

    it('starting next Saturday until September 18, 2018', () => {
      const result = v1Parser.parseString(`Danielle be working on this project for her team starting next Saturday until September 18, 2018`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Saturday').add(1, 'week'),
        'starting next Saturday'
      );
    });

    it('starting Sunday every day until next year', () => {
      const result = v1Parser.parseString(`My goal, starting Sunday and continuing every day until next year, is to be a cool person.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Sunday'),
        'starting Sunday'
      );
    });

    it('starting today every 2 days for 5 months', () => {
      const result = v1Parser.parseString(`Every 2 days for 5 months, remind me to get in touch with Monica, starting today.`);
      Utils.testRecurrentDate(
        result,
        Constants.StartOfToday(),
        'starting today'
      );
    });
  });
});

class Utils {
  static testOneTimeDate(result: IParsedDate, date: moment.Moment, startInputText: string, isRecurrent = false) {
    expect(result).to.not.be.null;

    const expectStart = moment.isMoment(date) ? date : moment((<any>date).text, (<any>date).format);
    const actualStart = moment(result.startDate, 'x');
    expect(expectStart.isSame(actualStart, 'day'),
      `
       Expect: ${expectStart.format('dddd DD MMMM YYYY')}
       Actual: ${actualStart.format('dddd DD MMMM YYYY')}
      `
    );
    expect(result.recurrence.isRecurrent).to.equal(isRecurrent);
    expect(result.startInputText).to.equal(startInputText);
  }

  static testRecurrentDate(result: IParsedDate, date: moment.Moment, startInputText: string) {
    this.testOneTimeDate(result, date, startInputText, true);
  }
}
