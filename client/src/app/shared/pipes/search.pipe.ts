import { Pipe, PipeTransform } from '@angular/core';
import { Theme } from '../interfaces/theme';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(themes: Theme[], searchInput: string): any[] {
    if (!searchInput) {
      return [];
    }

    searchInput = searchInput.toLowerCase();
    return themes.filter(
      x => x.title.toLowerCase().includes(searchInput)
    )
  }

}
