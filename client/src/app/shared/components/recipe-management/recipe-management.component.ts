import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-management',
  templateUrl: './recipe-management.component.html',
  styleUrls: ['./recipe-management.component.scss']
})
export class RecipeManagementComponent {
  @Input() recipes: any[] = [];
  @Output() recipeDeleted = new EventEmitter<string>();
  @Output() recipeRemovedFromFavorites = new EventEmitter<string>();

  constructor(private router: Router) {}

  createNewRecipe(): void {
    this.router.navigate(['/create-recipe']);
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/theme', recipeId]);
  }

  editRecipe(recipeId: string): void {
    // Navigate to recipe editing page (to be implemented)
    alert('Функцията за редактиране на рецепта ще бъде добавена скоро!');
  }

  deleteRecipe(recipeId: string): void {
    if (confirm('Сигурни ли сте, че искате да изтриете тази рецепта?')) {
      this.recipeDeleted.emit(recipeId);
    }
  }

  removeFromFavorites(recipeId: string): void {
    this.recipeRemovedFromFavorites.emit(recipeId);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Чакаща',
      'approved': 'Одобрена',
      'rejected': 'Отхвърлена'
    };
    return statusMap[status] || 'Неизвестен';
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return 'Неизвестна дата';
    const date = new Date(timestamp);
    return date.toLocaleDateString('bg-BG');
  }
}
