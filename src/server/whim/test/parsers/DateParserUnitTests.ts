import { IRecurFor, IRecurrenceUnit } from '../../src/models/date';
import { DateParsingConstants as Constants } from '../../src/parsers/dates/parsing/DateParsingConstants';
import { IParsedDate, IRecurEvery } from '../../src/models';
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
      Utils.testOneTimeDate(result, moment('September 7th', 'MMMM Do', true), 'on September 7th');
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
      Utils.testRecurrentDate(
        result,
        Constants.StartOfTomorrow(),
        'starting tomorrow',
        Constants.DefaultRecurrence,
        Constants.DefaultDuration
      );
    });

    it('starting Monday', () => {
      const result = v1Parser.parseString('Starting Monday, I will be working at Goldman Sachs');
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('monday'),
        'Starting Monday',
        Constants.DefaultRecurrence,
        Constants.DefaultDuration
      );
    });

    it('starting Friday', () => {
      const result = v1Parser.parseString(`I'll be visiting her frequently starting Friday.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('friday'),
        'starting Friday',
        Constants.DefaultRecurrence,
        Constants.DefaultDuration
      );
    });

    it('This week', () => {
      const result = v1Parser.parseString(`This week he finds out about whether he got the job.`);
      Utils.testOneTimeDate(result, Constants.StartOfWeek(), 'This week');
    });

    it('is this week', () => {
      const result = v1Parser.parseString(`All of his research is this week.`);
      Utils.testOneTimeDate(result, Constants.StartOfWeek(), 'is this week');
    });

    it('is next week', () => {
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
        undefined,
        { inputText: 'everyday', pattern: { amount: 1, interval: 'day'}, isAlternating: false },
        Constants.DefaultDuration
      );
    });

    it('Every day', () => {
      const result = v1Parser.parseString('Every day check in with Jack and Jill while they are climbing.');
      Utils.testRecurrentDate(
        result,
        Constants.StartOfToday(),
        undefined,
        { inputText: 'Every day', pattern: { amount: 1, interval: 'day'}, isAlternating: false },
        Constants.DefaultDuration
      );
    });

    it('every Wednesday', () => {
      const result = v1Parser.parseString('Make sure to text Ana every Wednesday.');
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('wednesday'),
        undefined,
        { inputText: 'every Wednesday', pattern: { amount: 1, interval: 'week'}, isAlternating: false },
        Constants.DefaultDuration
      );
    });

    it('every other Thursday', () => {
      const result = v1Parser.parseString('Check in with Charles every other Thursday at least.');
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('thursday'),
        undefined,
        { inputText: 'every other Thursday', pattern: { amount: 1, interval: 'week' }, isAlternating: true },
        Constants.DefaultDuration
      );
    });

    it('on August 25, 2018', () => {
      const result = v1Parser.parseString('Plan to be there on August 25, 2018.');
      Utils.testOneTimeDate(
        result,
        moment('August 25, 2018', 'MMMM D, YYYY', true),
        'on August 25, 2018'
      );
    });

    it('starting Tuesday every week', () => {
      const result = v1Parser.parseString(`I'll be going to the cafe starting Tuesday every week.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Tuesday'),
        'starting Tuesday',
        { inputText: 'every week', pattern: { amount: 1, interval: 'week' }, isAlternating: false },
        Constants.DefaultDuration
      );
    });

    it('starting Wednesday every other week for 2 weeks', () => {
      const result = v1Parser.parseString(`I'll be going for coffee starting Wednesday every other week for 2 weeks.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Wednesday'),
        'starting Wednesday',
        { inputText: 'every other week', pattern: { amount: 1, interval: 'week' }, isAlternating: true },
        { inputText: 'for 2 weeks', pattern: { amount: 2, interval: 'week' }, isForever: false },
        Constants.DaysUntil(Constants.NearestWeekday('Wednesday').add(2, 'weeks'))
      );
    });

    it('starting Thursday every day for 2 months', () => {
      const result = v1Parser.parseString(`Patrick will be teaching yoga for everyone in the office starting Thursday every day for 2 months.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Thursday'),
        'starting Thursday',
        { inputText: 'every day', pattern: { amount: 1, interval: 'day' }, isAlternating: false },
        { inputText: 'for 2 months', pattern: { amount: 2, interval: 'month' }, isForever: false },
        Constants.DaysUntil(Constants.NearestWeekday('Thursday').add(2, 'months'))
      );
    });

    it('every Friday for 2 days', () => {
      const result = v1Parser.parseString(`I should follow up every Friday for 2 days...`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Friday'),
        undefined,
        { inputText: 'every Friday', pattern: { amount: 1, interval: 'week' }, isAlternating: false },
        { inputText: 'for 2 days', pattern: { amount: 2, interval: 'day' }, isForever: false },
        Constants.DaysUntil(Constants.NearestWeekday('Friday')) + 2
      );
    });

    it('starting next Saturday until September 18, 2018', () => {
      const result = v1Parser.parseString(`Danielle be working on this project for her team starting next Saturday until September 18, 2018`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Saturday').add(1, 'week'),
        'starting next Saturday',
        Constants.DefaultRecurrence,
        { inputText: 'until September 18, 2018', pattern: { amount: Constants.DaysUntil(moment('September 18, 2018', 'MMMM DD, YYYY', true)), interval: 'day' }, isForever: false },
        Constants.DaysUntil(moment('September 18, 2018', 'MMMM DD, YYYY', true))
      );
    });

    it('starting Sunday every other day until next year', () => {
      const result = v1Parser.parseString(`My goal, starting Sunday and continuing every other day until next year, is to be a cool person.`);
      Utils.testRecurrentDate(
        result,
        Constants.NearestWeekday('Sunday'),
        'starting Sunday',
        { inputText: 'every other day', pattern: { amount: 1, interval: 'day' }, isAlternating: true },
        { inputText: 'until next year', pattern: { amount: Constants.DaysUntil(Constants.StartOfYear().add(1, 'year')), interval: 'day' }, isForever: false },
        Constants.DaysUntil(Constants.StartOfYear().add(1, 'year'))
      );
    });

    it('Every 2 days for 5 months... starting today.', () => {
      const result = v1Parser.parseString(`Every 2 days for 5 months, remind me to get in touch with Monica, starting today.`);
      Utils.testRecurrentDate(
        result,
        Constants.StartOfToday(),
        'starting today',
        { inputText: 'Every 2 days', pattern: { amount: 2, interval: 'day' }, isAlternating: false },
        { inputText: 'for 5 months', pattern: { amount: 5, interval: 'month' }, isForever: false },
        Constants.DaysUntil(Constants.StartOfToday().add(5, 'months'))
      );
    });

    it('every day until tomorrow', () => {
      const result = v1Parser.parseString(`Remind me every day until tomorrow.`);
      Utils.testRecurrentDate(
        result,
        Constants.StartOfToday(),
        undefined,
        { inputText: 'every day', pattern: { amount: 1, interval: 'day' }, isAlternating: false },
        { inputText: 'until tomorrow', pattern: { amount: 2, interval: 'day' }, isForever: false },
        2
      );
    });

    it('until tomorrow', () => {
      const result = v1Parser.parseString(`Remind me to do this until tomorrow.`);
      Utils.testRecurrentDate(
        result,
        Constants.StartOfToday(),
        undefined,
        Constants.DefaultRecurrence,
        { inputText: 'until tomorrow', pattern: { amount: 2, interval: 'day' }, isForever: false },
        2
      );
    });
  });
});

class Utils {
  static testOneTimeDate(result: IParsedDate, expectStartDate: moment.Moment, startInputText: string, isRecurrent = false) {
    expect(result).to.not.be.null;

    const actualStartDate = moment(result.startDate, 'x', true);
    expect(expectStartDate.isSame(actualStartDate, 'second'),
      `
       Expect: ${expectStartDate.format('dddd DD MMMM YYYY')}
       Actual: ${actualStartDate.format('dddd DD MMMM YYYY')}
      `
    );
    expect(result.recurrence.isRecurrent).to.equal(isRecurrent);
    expect(result.startInputText).to.equal(startInputText);
    if (!isRecurrent) {
      expect(result.endDate).to.equal(result.startDate);
    }
  }

  static testRecurrentDate(result: IParsedDate, startDate: moment.Moment, startInputText: string, recurEvery: IRecurEvery, recurFor: IRecurFor, daysFromNowUntilEnd?: number) {
    this.testOneTimeDate(result, startDate, startInputText, true);

    expect(result.recurrence.recurEvery).to.not.be.null;
    expect(result.recurrence.recurFor).to.not.be.null;

    expect(result.recurrence.recurEvery.inputText).to.equal(recurEvery.inputText);
    expect(result.recurrence.recurFor.inputText).to.equal(recurFor.inputText);
    expect(result.recurrence.recurEvery.isAlternating).to.equal(recurEvery.isAlternating);
    expect(result.recurrence.recurFor.isForever).to.equal(recurFor.isForever);
    expect(result.recurrence.recurEvery.pattern).to.deep.equal(recurEvery.pattern);
    expect(result.recurrence.recurFor.pattern).to.deep.equal(recurFor.pattern);
    expect(startDate).to.not.equal(result.endDate);
    if (!recurFor.isForever) {
      const expectedEndDate = Constants.StartOfToday().add(daysFromNowUntilEnd, 'days');
      const actualEndDate = moment(result.endDate, 'x', true);
      const actualStartDate = moment(result.startDate, 'x', true);
      expect(Constants.DaysUntil(actualEndDate)).to.equal(daysFromNowUntilEnd,
        `
          Expected end date: ${expectedEndDate.valueOf()} (${expectedEndDate.format('dddd DD MMMM YYYY')})
          Actual end date: ${actualEndDate.valueOf()} (${actualEndDate.format('dddd DD MMMM YYYY')})
          Expected start date: ${startDate.valueOf()} (${startDate.format('dddd DD MMMM YYYY')})
          Actual start date: ${actualStartDate.valueOf()} (${actualStartDate.format('dddd DD MMMM YYYY')})
        `
      );
    }
  }
}
