import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'dateFormat'})
export class DateFormatPipe implements PipeTransform {
  transform(timestamp: number, format?: string): string {
    const momentObj = moment(timestamp, 'x');
    if (format) {
      return momentObj.format(format);
    }
    const now = moment(Date.now(), 'x');
    // Check for 1) just now, 2) today, and 3) yesterday, and 4) same year
    if (now.isSame(momentObj, 'minute')) {
      return 'just now';
    } else if (momentObj.isSame(now, 'day')) {
      return `today, ${momentObj.format('h:mm a')}`;
    } else if (momentObj.isSame(now.clone().subtract(1, 'days'), 'day')) {
      return `yesterday, ${momentObj.format('h:mm a')}`;
    } else if (momentObj.isSame(now.clone().startOf('year'), 'year')) {
      return momentObj.format('MMMM D, h:mm a');
    } else {
      return momentObj.format('M/D/YY h:mm a');
    }
  }
}
