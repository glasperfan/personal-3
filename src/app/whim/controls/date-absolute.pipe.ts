import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'dateAbs'})
export class DateAbsoluteFormatPipe implements PipeTransform {
  transform(timestamp: number, standardFormat = 'M/D/YY'): string {
    if (timestamp === Number.MAX_SAFE_INTEGER) {
      return 'never';
    }

    return moment(timestamp, 'x', true).format(standardFormat);
  }
}
