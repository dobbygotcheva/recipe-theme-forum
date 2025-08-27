import { Pipe, PipeTransform } from '@angular/core';
import { max } from 'rxjs';

@Pipe({
  name: 'slice'
})
export class SlicePipe implements PipeTransform {

  transform(value: string, maxCharCount=100): unknown {
    return `${value.substring(0, maxCharCount)}${value.length > maxCharCount ? "..." : ''}`;
  }

}
