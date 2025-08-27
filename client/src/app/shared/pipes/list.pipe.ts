import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'list'
})
export class ListPipe implements PipeTransform {

  transform(text: string | undefined, separator: string = ',' ): string []{
    
      if (!text) {
        return [];
      }
      return text.split(separator).map(item => item.trim());
  
    }
}
