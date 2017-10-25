import { QueryFriendParseResult } from '../../src/parsers/commands/results/QueryFriendParseResult';
import { AddEventParseResult } from '../../src/parsers/commands/results/AddEventParseResult';
import { DateParsingConstants } from '../../src/parsers/dates/parsing/DateParsingConstants';
import { AddFriendParseResult } from '../../src/parsers/commands/results/AddFriendParseResult';
import { expect } from 'chai';
import * as moment from 'moment';
import { IFriend, MethodCode } from '../../src/models';

describe('Parsing results', () => {

  describe('Adding friends', () => {

    it(`should only accept commands that start with 'add'`, () => {
      expect(AddFriendParseResult.validate([])).to.be.false;
      expect(AddFriendParseResult.validate([' adD '])).to.be.true;
      expect(AddFriendParseResult.validate(['add', 'Joe', 'Schmoe'])).to.be.true;
      expect(AddFriendParseResult.validate(['addfoo', 'Joe', 'Schmoe'])).to.be.false;
      expect(AddFriendParseResult.validate(['ADD', 'Joe', 'Schmoe'])).to.be.true;
      expect(AddFriendParseResult.validate(['  Add ', 'Joe', 'Schmoe'])).to.be.true;
    });

    describe('Extracting names', () => {
      const parseName = (input: string, firstName: string, lastName: string): void => {
        expect(AddFriendParseResult.validate(input.split(' '))).to.be.true;
        const result = new AddFriendParseResult(input.split(' ')).arguments;
        expect(result.first === firstName && result.last === lastName).to.be.true;
      };

      it(`Parses 'add Joe Schmoe'`, () => parseName('add Joe Schmoe', 'Joe', 'Schmoe'));
      it(`Parses 'add Joe Paul Schmoe Jr. the IV'`, () => parseName('add Joe Paul Schmoe Jr. the IV', 'Joe', 'Paul'));
      it(`Parses 'add Joe 444-555-4455  #tag Schmoe is a person'`, () => parseName('add Joe 444-555-4455  #tag Schmoe is a person', 'Joe', undefined));
      it(`Parses 'add Joe'`, () => parseName('add Joe', 'Joe', undefined));
      it(`Does not parse 'add'`, () => parseName('add', undefined, undefined));
    });

    describe('Extracting phone numbers', () => {
      const parsePhoneNumber = (phoneNumber: string, shouldSucceed = true): void => {
        const result = new AddFriendParseResult(['add', 'Joe', 'Schmoe'].concat(phoneNumber.split(' '))).arguments;
        expect(shouldSucceed ? result.phone === phoneNumber : result.phone !== phoneNumber).to.be.true;
      };

      it(`Parses 455-444-4455`, () => parsePhoneNumber('455-444-4455'));
      it(`Parses (455)-444-4455`, () => parsePhoneNumber('(455)-444-4455'));
      it(`Parses 4554444455`, () => parsePhoneNumber('4554444455'));
      it(`Parses 455 444 4455`, () => parsePhoneNumber('455 444 4455'));
      it(`Parses 123.456.7890`, () => parsePhoneNumber('123.456.7890'));
      it(`Does not parse 'foo'`, () => parsePhoneNumber('foo', false));
      it(`Does not parse 111`, () => parsePhoneNumber('111', false));
      it(`Does not parse 11-11-111`, () => parsePhoneNumber('11-11-111', false));
    });

    describe('Extracting emails', () => {
      const parseEmail = (email: string, shouldSucceed = true): void => {
        const result = new AddFriendParseResult(['add', 'Joe', 'Schmoe', email]).arguments;
        expect(shouldSucceed ? result.email === email : result.email !== email).to.be.true;
      };

      it('Parses joe@schmoe.com', () => parseEmail('joe@schmoe.com'));
      it('Does not parse joe@', () => parseEmail('joe@', false));
      it('Does not parse notanemail', () => parseEmail('notanemail', false));
    });

    describe('Extracting birthdays', () => {
      const parseBirthday = (birthday: string, resultTimestamp: moment.Moment, shouldSucceed = true): void => {
        const input = ['add', 'Joe', 'Schmoe'].concat(birthday.split(' '));
        const result = new AddFriendParseResult(input).arguments;
        expect(shouldSucceed
          ? result.birthday === resultTimestamp.valueOf().toString()
          : result.birthday === undefined,
          `Comparing ${result.birthday} and ${resultTimestamp && resultTimestamp.valueOf().toString()}`
        ).to.be.true;
      };

      it('Parses October 1', () => parseBirthday(
        'October 1',
        moment('October 1', 'MMMM D', true)
      ));
      it('Parses October 1st', () => parseBirthday(
        'October 1st',
        moment('October 1st', 'MMMM Do', true)
      ));
      it('Parses October 1st 1994', () => parseBirthday(
        'October 1st 1994',
        moment('October 1st 1994', 'MMMM Do YYYY', true)
      ));
      it(`Parses tomorrow`, () => parseBirthday(
        'tomorrow',
        DateParsingConstants.StartOfTomorrow()
      ));
      it(`Does not parse 'joe@schmoe'`, () => parseBirthday('joe@schmoe', undefined, false));
    });

    describe('Extracting tags', () => {
      const parseTags = (input: string, tags: string[]): void => {
        const result = new AddFriendParseResult(input.split(' ')).arguments;
        expect(result.tags).to.eql(tags);
      };

      it('Parses #tag', () => parseTags('add Joe Schmoe #tag', ['#tag']));
      it('Parses #tag #tag2', () => parseTags('add #tag Joe #tag2', ['#tag', '#tag2']));
      it('Removes duplicates', () => parseTags('add Joe #tag #tag2 #tag ', ['#tag', '#tag2']));
      it(`Finds no tags in 'add Joe # '`, () => parseTags('add Joe # ', []));
      it(`Finds no tags in 'add foo'`, () => parseTags('add foo', []));
    });
  });

  describe('Adding events', () => {
    describe('Should only select commands that include date-related keywords', () => {
      it('[No text should return false]', () => {
        expect(AddEventParseResult.validate([])).to.be.false;
      });
      it(`Text Jared today.`, () => {
        expect(AddEventParseResult.validate(`Text Jared today.`.split(' '))).to.be.true;
      });
      it(`Tyler's birthday is Monday`, () => {
        expect(AddEventParseResult.validate(`Tyler's birthday is Monday`.split(' '))).to.be.true;
      });
      it(`Next week go to the supermarket.`, () => {
        expect(AddEventParseResult.validate(`Next week go to the supermarket.`.split(' '))).to.be.true;
      });
      it(`Patrick comes back from Europe next week.`, () => {
        expect(AddEventParseResult.validate(`Patrick comes back from Europe next week.`.split(' '))).to.be.true;
      });
      it(`Yoga starting Saturday every week for 2 months.`, () => {
        expect(AddEventParseResult.validate(`Yoga starting Saturday every week for 2 months.`.split(' '))).to.be.true;
      });
      it(`This should not be an event.`, () => {
        expect(AddEventParseResult.validate(`This should not be an event.`.split(' '))).to.be.false;
      });
      it(`This is not an event either.`, () => {
        expect(AddEventParseResult.validate(`This is not an event either.`.split(' '))).to.be.false;
      });
      it(`Using the keyword every is not sufficient.`, () => {
        expect(AddEventParseResult.validate(`Using the keyword every is not sufficient.`.split(' '))).to.be.false;
      });
      it('foo bar for nothing', () => {
        expect(AddEventParseResult.validate(`foo bar for nothing`.split(' '))).to.be.false;
      });
    });

    describe('Extracting titles', () => {
      const parseTitle = (input: string, expectedTitle: string): void => {
        const result = new AddEventParseResult(input.split(' ')).arguments;
        expect(result.title).to.equal(expectedTitle);
      };

      it(`Parses 'Josh's birthday on October 27th'`, () => {
        parseTitle(`Josh's birthday on October 27th`, `Josh's birthday`);
      });
      it(`Parses 'Josh's birthday on September 7th every year'`, () => {
        parseTitle(`Josh's birthday on September 7th every year`, `Josh's birthday`);
      });
      it(`Parses 'Start contacting people Wednesday'`, () => {
        parseTitle(`Start contacting people Wednesday`, `Start contacting people`);
      });
      it(`Parses 'Next week go to the supermarket'`, () => {
        parseTitle(`Next week go to the supermarket`, `go to the supermarket`);
      });
    });

    describe('Extracting dates', () => {
      const parseEventDate = (input: string, expectedDate: moment.Moment): void => {
        const expectedStartDate: number = expectedDate && expectedDate.valueOf();
        const result = new AddEventParseResult(input.split(' ')).arguments;
        expect(result.date.startDate).to.equal(expectedStartDate);
      };

      it(`Parses 'Josh's birthday on October 27th'`, () => {
        parseEventDate(`Josh's birthday on October 27th`, moment('October 27th', 'MMMM Do', true));
      });
      it(`Parses 'Josh's birthday on September 7th every year'`, () => {
        parseEventDate(`Josh's birthday on September 7th every year`, moment('September 7th', 'MMMM Do', true));
      });
      it(`Parses 'Start contacting people Wednesday'`, () => {
        parseEventDate(`Start contacting people Wednesday`, DateParsingConstants.NearestWeekday('Wednesday'));
      });
      it(`Parses 'Start contacting people Wednesday #tag'`, () => {
        parseEventDate(`Start contacting people Wednesday #tag`, DateParsingConstants.NearestWeekday('Wednesday'));
      });
      it(`Parses 'Next week go to the supermarket'`, () => {
        parseEventDate(`Next week go to the supermarket`, DateParsingConstants.StartOfNextWeek());
      });
    });

    describe('Extracting tags', () => {
      const parseTags = (input: string, tags: string[]): void => {
        const result = new AddEventParseResult(input.split(' ')).arguments;
        expect(result.tags).to.eql(tags);
      };

      it('Parses #tag', () => parseTags(`Josh's birthday on October 27th #tag`, ['#tag']));
      it('Parses #tag #tag2', () => parseTags(`Josh's birthday on #tag September 7th every year #tag2`, ['#tag', '#tag2']));
      it('Removes duplicates', () => parseTags('Start contacting people Wednesday #tag #tag2 #tag ', ['#tag', '#tag2']));
      it(`Finds no tags in 'Next week... # '`, () => parseTags('Next week go to the supermarket # ', []));
      it(`Finds no tags in 'Next week foo'`, () => parseTags('Next week foo', []));
    });
  });

  describe('Querying friends', () => {

    const friendJoe: IFriend = {
      _id: '1',
      userId: '11',
      name: { first: 'Joe', last: 'Schmoe', displayName: 'Joe Schmoe' },
      address: {
        address1: '14 Elm St',
        address2: 'Unit 2',
        city: 'Austin',
        state: 'TX',
        country: 'USA'
      },
      tags: ['#tag', '#tag2'],
      methods: [], // TODO: improve methods
      whenAdded: moment('May 11th, 2017', 'MMMM Do, YYYY', true).valueOf(),
      whenLastModified: moment('Septembmer 24th, 2017', 'MMMM Do, YYYY', true).valueOf()
    };

    const friendSally: IFriend = {
      _id: '2',
      userId: '22',
      name: { first: 'Sally', last: 'Fields', displayName: 'Sally Fields' },
      address: {},
      tags: ['#boston', '#2k17'],
      methods: [],
      whenAdded: Date.now(),
      whenLastModified: Date.now()
    };

    const friendMark: IFriend = {
      _id: '3',
      userId: '33',
      name: { first: 'Mark', last: 'Hamil', displayName: 'Mark Hamil' },
      address: { city: 'New York City' },
      tags: [],
      methods: [
        { message: 'Send an email', methodCode: MethodCode.Email },
        { message: 'You should call', methodCode: MethodCode.Call }
      ],
      whenAdded: Date.now(),
      whenLastModified: Date.now()
    };

    describe('Extracting headers', () => {
      const parseTitle = (input: IFriend, components: string[], expectedHeader: string) => {
        const result = new QueryFriendParseResult(input, components).AsResult();
        expect(result.header).to.equal(expectedHeader);
      };

      it('Uses the display name as the header', () => {
        parseTitle(friendJoe, ['Joe', 'Schmoe'], friendJoe.name.displayName);
        parseTitle(friendMark, ['Mark'], friendMark.name.displayName);
        parseTitle(friendSally, [], friendSally.name.displayName);
      });
    });

  });

  describe('Querying events', () => {

  });

});
