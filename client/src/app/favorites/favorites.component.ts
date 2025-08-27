import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Theme } from '../shared/interfaces/theme';
import { FavoritesService } from '../shared/services/favorites.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: Theme[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  defaultDate = new Date();

  constructor(
    private favoritesService: FavoritesService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Wait for user service to initialize
    if (this.userService.user) {
      this.checkAuthAndLoad();
    } else {
      // Subscribe to user changes and wait for initialization
      this.userService.user$.subscribe(user => {
        if (user) {
          this.checkAuthAndLoad();
        }
      });
    }
  }

  private checkAuthAndLoad(): void {
    if (!this.userService.isLogged) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadFavorites();
  }

  loadFavorites(): void {
    console.log('FavoritesComponent: Loading favorites...');
    console.log('FavoritesComponent: User service isLogged:', this.userService.isLogged);
    console.log('FavoritesComponent: User service user:', this.userService.user);

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.favoritesService.getUserFavorites().subscribe({
      next: (favorites) => {
        console.log('FavoritesComponent: Received favorites from API:', favorites);
        this.favorites = favorites.map(theme => ({
          ...theme,
          title: theme.title || 'Без заглавие',
          img: theme.img || 'assets/logo.jpg',
          time: theme.time || 0,
          ingredients: theme.ingredients || '',
          text: theme.text || '',
          averageRating: theme.averageRating || 0,
          totalRatings: theme.totalRatings || 0,
          created_at: theme.created_at || new Date().toISOString(),
          ratings: theme.ratings || [],
          comments: theme.comments || []
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.hasError = true;
        this.errorMessage = 'Грешка при зареждане на любимите рецепти. Моля, опитайте отново.';
        this.isLoading = false;
      },
    });
  }

  removeFromFavorites(themeId: string): void {
    this.favoritesService.removeFromFavorites(themeId).subscribe({
      next: () => {
        // Remove from local array
        this.favorites = this.favorites.filter(theme => theme._id !== themeId);
      },
      error: (err) => {
        console.error('Error removing from favorites:', err);
        // You could show a toast notification here
      }
    });
  }

  getStarClass(rating: number, star: number): string {
    if (rating >= star) {
      return 'filled';
    } else if (rating >= star - 0.5) {
      return 'half-filled';
    } else {
      return 'empty';
    }
  }

  onImageError(event: any): void {
    event.target.src = 'assets/logo.jpg';
  }

  retryLoad(): void {
    this.loadFavorites();
  }
}
