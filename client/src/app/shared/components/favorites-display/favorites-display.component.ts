import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites-display',
  templateUrl: './favorites-display.component.html',
  styleUrls: ['./favorites-display.component.scss']
})
export class FavoritesDisplayComponent {
  @Input() recipes: any[] = [];
  @Input() title: string = 'Любими рецепти';
  @Input() emptyMessage: string = 'Нямате любими рецепти';
  @Input() showRemoveButton: boolean = false;
  @Output() recipeRemoved = new EventEmitter<string>();

  constructor(private router: Router) {}

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/theme', recipeId]);
  }

  removeFromFavorites(recipeId: string): void {
    this.recipeRemoved.emit(recipeId);
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return 'Неизвестна дата';
    const date = new Date(timestamp);
    return date.toLocaleDateString('bg-BG');
  }
}
