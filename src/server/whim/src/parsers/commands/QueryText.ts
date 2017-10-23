import { ISnippet } from './contracts/ISnippet';
import { IDateParser } from '../dates/contracts/IDateParser';
import { IEvent, IFriend } from '../../models';
import { DateParser } from '../dates';
import * as moment from 'moment';

export class QueryText {
  /* TODO: implement caching system */
  public static DateParser: IDateParser = new DateParser();
  public static ParseFriend(f: IFriend): ISnippet[] {
    return [
      { text: f.name.displayName, field: 'name' },
      { text: f.birthday && moment(f.birthday, 'x', true).format('MMMM Do'), field: 'birthday' },
      { text: f.email, field: 'email' },
      { text: f.phone, field: 'phone' },
      { text: f.address && f.address.city, field: 'location' },
      { text: f.organization, field: 'organization' },
      { text: f.skills && f.skills.join(', '), field: 'skills' },
      { text: f.notes.map(note => note.text).join(' '), field: 'notes' }
    ].map(s => this.Normalize(s));
  }

  public static ParseEvent(e: IEvent): ISnippet[] {
    const startDate = this.DateParser.parseString(e.date && e.date.startDate && e.date.startDate.toString());
    const startMoment = startDate && moment(startDate.startDate, 'x', true);
    return [
      { text: e.title, field: 'title' },
      { text: startMoment && startMoment.format('MMMM D, YYYY'), field: 'date' },
      { text: e.description, field: 'description' },
      { text: e.relatedFriends && e.relatedFriends.join(', '), field: 'tagged friends' },
    ].map(s => this.Normalize(s));
  }

  private static Normalize(s: ISnippet): ISnippet {
    s.text = s.text && s.text.trim();
    return s;
  }
}
