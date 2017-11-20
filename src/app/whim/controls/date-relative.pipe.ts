import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'dateRel' })
export class DateRelativeFormatPipe implements PipeTransform {
  transform(timestamp: number, standardFormat = 'M/D/YY'): string {
    if (timestamp === Number.MAX_SAFE_INTEGER) {
      return 'never';
    }

    const momentObj = moment(timestamp, 'x', true);
    const now = moment();

    if (momentObj.isSame(now, 'day')) {
      return 'today';
    } else if (momentObj.isSame(now.clone().subtract(1, 'days'), 'day')) {
      return 'yesterday';
    } else if (momentObj.isSame(now.clone().add(1, 'days'), 'day')) {
      return 'tomorrow';
    } else if (momentObj < now.clone().add(1, 'week').startOf('day')) {
      return momentObj.format('MMM D (dddd)');
    } else if (momentObj.isSame(now.clone().startOf('year'), 'year')) {
      return momentObj.format('MMM D');
    } else {
      return momentObj.format(standardFormat);
    }
  }
}
