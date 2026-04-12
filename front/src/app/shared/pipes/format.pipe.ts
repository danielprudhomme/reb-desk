import { Pipe, PipeTransform } from '@angular/core';
import { DisplayPipe } from '@app/core/models/display-pipe';

@Pipe({ name: 'format' })
export class FormatPipe implements PipeTransform {
  transform(value: string, displayPipe: DisplayPipe): string {
    switch (displayPipe) {
      case 'percent':
        return `${(+value).toFixed(2)} %`;

      case 'amount':
        return `${(+value).toFixed(0)} €`;

      case 'ratio':
        return (+value).toFixed(2);

      case 'number':
      default:
        return value;
    }
  }
}
