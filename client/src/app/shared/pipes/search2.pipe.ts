import { Pipe, PipeTransform } from '@angular/core';
import { Theme } from '../interfaces/theme';

@Pipe({
  name: 'search2'
})
export class Search2Pipe implements PipeTransform {

  transform(themes: Theme[], searchInput1: string): any[] {
    if (!searchInput1) {
      return [];
    }

    searchInput1 = searchInput1.toLowerCase();
    return themes.filter(
      x => x.category.toLowerCase().includes(searchInput1)
    )
  }

}
