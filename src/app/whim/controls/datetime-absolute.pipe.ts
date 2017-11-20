import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'datetimeAbs' })
export class DatetimeAbsoluteFormatPipe implements PipeTransform {
  transform(timestamp: number, standardFormat = 'M/D/YY h:mm a'): string {
    if (timestamp === Number.MAX_SAFE_INTEGER) {
      return 'never';
    }

    return moment(timestamp, 'x', true).format(standardFormat);
  }
}
