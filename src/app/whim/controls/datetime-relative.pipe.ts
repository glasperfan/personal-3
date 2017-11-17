import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'datetimeRel'})
export class DatetimeRelativeFormatPipe implements PipeTransform {
  transform(timestamp: number, standardFormat = 'M/D/YY h:mm a'): string {
    if (timestamp === Number.MAX_SAFE_INTEGER) {
      return 'never';
    }

    const momentObj = moment(timestamp, 'x', true);
    const now = moment();

    if (now.isSame(momentObj, 'minute')) {
      return 'just now';
    } else if (momentObj.isSame(now, 'day')) {
      return `today, ${momentObj.format('h:mm a')}`;
    } else if (momentObj.isSame(now.clone().subtract(1, 'days'), 'day')) {
      return `yesterday, ${momentObj.format('h:mm a')}`;
    } else if (momentObj.isSame(now.clone().startOf('year'), 'year')) {
      return momentObj.format('MMMM D, h:mm a');
    } else {
      return momentObj.format(standardFormat);
    }
  }
}
