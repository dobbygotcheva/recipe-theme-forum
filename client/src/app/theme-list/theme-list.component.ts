import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { Theme } from '../shared/interfaces/theme';
import { FavoritesService } from '../shared/services/favorites.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-theme-list',
  templateUrl: './theme-list.component.html',
  styleUrls: ['./theme-list.component.scss']
})
export class ThemeListComponent implements OnInit {

  themesList: Theme[] = [];
  originalThemesList: Theme[] = []; // Keep original list for sorting
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  selectedSort: string = 'newest';
  defaultDate = new Date(); // Add this for template use
  favoriteStatus: { [key: string]: boolean } = {}; // Track favorite status for each theme
  userLikeStatus: { [key: string]: { liked: boolean, disliked: boolean } } = {}; // Track user like/dislike status

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private favoritesService: FavoritesService,
    private http: HttpClient
  ) { }

  get isLogged(): boolean {
    return this.userService.isLogged;
  }

  ngOnInit(): void {
    console.log('ThemeListComponent initialized');
    this.loadThemes();
  }

  loadThemes(): void {
    console.log('Loading themes...');
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('Making API call to getThemes...');
    this.apiService.getThemes().subscribe({
      next: (themes) => {
        console.log('Received themes from API:', themes);
        try {
          // Ensure all themes have required properties with default values
          this.themesList = themes.map(theme => ({
            ...theme,
            _id: theme._id || '',
            title: theme.title || 'Без заглавие',
            category: theme.category || '',
            img: theme.img || 'assets/logo.jpg',
            time: theme.time || 0,
            ingredients: theme.ingredients || '',
            text: theme.text || '',
            userId: theme.userId || '',
            averageRating: theme.averageRating || 0,
            totalRatings: theme.totalRatings || 0,
            created_at: theme.created_at || new Date().toISOString(),
            ratings: theme.ratings || [],
            comments: theme.comments || [],
            posts: theme.posts || [],
            updatedAt: theme.updatedAt || new Date().toISOString(),
            _v: theme._v || 0,
            likes: theme.likes || [],
            dislikes: theme.dislikes || []
          }));

          this.originalThemesList = [...this.themesList]; // Create a copy
          console.log('Themes processed, count:', this.themesList.length);
          this.sortThemes(); // Apply initial sorting
          this.loadFavoriteStatus(); // Load favorite status for all themes
          this.loadUserLikeStatus(); // Load user like/dislike status for all themes
          this.isLoading = false;
          console.log('Loading complete, themes ready to display');
        } catch (error) {
          console.error('Error processing themes data:', error);
          this.hasError = true;
          this.errorMessage = 'Грешка при обработка на данните. Моля, опитайте отново.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading themes:', err);
        console.log('Error details:', err.status, err.statusText, err.message);
        this.hasError = true;
        this.errorMessage = 'Грешка при зареждане на рецептите. Моля, опитайте отново.';
        this.isLoading = false;
      }
    });
  }

  loadFavoriteStatus(): void {
    if (!this.isLogged) {
      return;
    }

    // Load favorite status for each theme
    this.themesList.forEach(theme => {
      if (theme._id) {
        this.favoritesService.checkFavorite(theme._id).subscribe({
          next: (response) => {
            this.favoriteStatus[theme._id] = response.isFavorite;
          },
          error: (err) => {
            console.error('Error checking favorite status for theme:', theme._id, err);
            this.favoriteStatus[theme._id] = false;
          }
        });
      }
    });
  }

  loadUserLikeStatus(): void {
    if (!this.isLogged || !this.userService.user) {
      return;
    }

    const userId = this.userService.user._id;

    // Initialize user like/dislike status for each theme
    this.themesList.forEach(theme => {
      if (theme._id) {
        this.userLikeStatus[theme._id] = {
          liked: !!(theme.likes && theme.likes.includes(userId)),
          disliked: !!(theme.dislikes && theme.dislikes.includes(userId))
        };
      }
    });
  }

  toggleFavorite(themeId: string): void {
    if (!this.isLogged) {
      // Redirect to login if not logged in
      return;
    }

    if (!themeId) {
      console.error('Invalid theme ID for favorite toggle');
      return;
    }

    const isCurrentlyFavorite = this.favoriteStatus[themeId] || false;

    this.favoritesService.toggleFavorite(themeId, isCurrentlyFavorite).subscribe({
      next: () => {
        // Update local status
        this.favoriteStatus[themeId] = !isCurrentlyFavorite;
      },
      error: (err) => {
        console.error('Error toggling favorite for theme:', themeId, err);
        // You could show a toast notification here
      }
    });
  }

  isFavorite(themeId: string): boolean {
    return this.favoriteStatus[themeId] || false;
  }

  // Like/Dislike functionality with immediate UI updates
  likeRecipe(themeId: string, action: 'like' | 'dislike'): void {
    if (!this.isLogged || !this.userService.user) {
      alert('Моля, влезте в системата за да харесате рецептата');
      return;
    }

    const theme = this.themesList.find(t => t._id === themeId);
    if (!theme) return;

    const userId = this.userService.user._id;
    const currentStatus = this.userLikeStatus[themeId] || { liked: false, disliked: false };

    // Ensure likes and dislikes arrays are initialized
    if (!theme.likes) theme.likes = [];
    if (!theme.dislikes) theme.dislikes = [];

    // Optimistically update the UI immediately
    if (action === 'like') {
      if (currentStatus.liked) {
        // Unlike
        theme.likes = theme.likes.filter((id: string) => id !== userId);
        this.userLikeStatus[themeId] = { liked: false, disliked: false };
      } else {
        // Like
        if (!theme.likes.includes(userId)) {
          theme.likes.push(userId);
        }
        // Remove from dislikes if previously disliked
        theme.dislikes = theme.dislikes.filter((id: string) => id !== userId);
        this.userLikeStatus[themeId] = { liked: true, disliked: false };
      }
    } else {
      if (currentStatus.disliked) {
        // Undislike
        theme.dislikes = theme.dislikes.filter((id: string) => id !== userId);
        this.userLikeStatus[themeId] = { liked: false, disliked: false };
      } else {
        // Dislike
        if (!theme.dislikes.includes(userId)) {
          theme.dislikes.push(userId);
        }
        // Remove from likes if previously liked
        theme.likes = theme.likes.filter((id: string) => id !== userId);
        this.userLikeStatus[themeId] = { liked: false, disliked: true };
      }
    }

    // Make API call in background
    this.http.post(`/api/themes/${themeId}/like`, { action }).subscribe({
      next: (response: any) => {
        // API call successful, no need to update UI again
        console.log('Like/dislike action completed successfully:', response);
      },
      error: (err) => {
        console.error('Error liking/disliking recipe:', err);
        // Revert the optimistic update on error
        this.fetchTheme();
        alert('Грешка при харесване на рецептата. Моля, опитайте отново.');
      }
    });
  }

  hasUserLiked(themeId: string): boolean {
    return this.userLikeStatus[themeId]?.liked || false;
  }

  hasUserDisliked(themeId: string): boolean {
    return this.userLikeStatus[themeId]?.disliked || false;
  }

  getLikeCount(theme: Theme): number {
    return theme.likes ? theme.likes.length : 0;
  }

  getDislikeCount(theme: Theme): number {
    return theme.dislikes ? theme.dislikes.length : 0;
  }

  fetchTheme(): void {
    // Reload themes to revert optimistic changes on error
    this.loadThemes();
  }

  sortThemes(): void {
    if (!this.themesList || this.themesList.length === 0) {
      return;
    }

    try {
      switch (this.selectedSort) {
        case 'newest':
          this.themesList.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          break;
        case 'oldest':
          this.themesList.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB;
          });
          break;
        case 'rating-high':
          this.themesList.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          break;
        case 'rating-low':
          this.themesList.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
          break;
        case 'title':
          this.themesList.sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return titleA.localeCompare(titleB);
          });
          break;
        case 'title-reverse':
          this.themesList.sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return titleB.localeCompare(titleA);
          });
          break;
        case 'time':
          this.themesList.sort((a, b) => (a.time || 0) - (b.time || 0));
          break;
        case 'time-reverse':
          this.themesList.sort((a, b) => (b.time || 0) - (a.time || 0));
          break;
        // Nutritional sorting options
        case 'calories-low':
          this.themesList.sort((a, b) => (a.calories || 0) - (b.calories || 0));
          break;
        case 'calories-high':
          this.themesList.sort((a, b) => (b.calories || 0) - (a.calories || 0));
          break;
        case 'protein-high':
          this.themesList.sort((a, b) => (b.protein || 0) - (a.protein || 0));
          break;
        case 'protein-low':
          this.themesList.sort((a, b) => (a.protein || 0) - (b.protein || 0));
          break;
        case 'carbs-low':
          this.themesList.sort((a, b) => (a.carbs || 0) - (b.carbs || 0));
          break;
        case 'carbs-high':
          this.themesList.sort((a, b) => (b.carbs || 0) - (a.carbs || 0));
          break;
        case 'fats-low':
          this.themesList.sort((a, b) => (a.fats || 0) - (b.fats || 0));
          break;
        case 'fats-high':
          this.themesList.sort((a, b) => (b.fats || 0) - (a.fats || 0));
          break;
        default:
          this.themesList = [...this.originalThemesList];
      }
    } catch (error) {
      console.error('Error sorting themes:', error);
      // Fallback to original list if sorting fails
      this.themesList = [...this.originalThemesList];
    }
  }

  getStarClass(rating: number, star: number): string {
    if (!rating || rating <= 0) {
      return 'empty';
    }
    if (rating >= star) {
      return 'filled';
    }
    if (rating >= star - 0.5) {
      return 'half-filled';
    }
    return 'empty';
  }

  hasNutritionalInfo(theme: any): boolean {
    return !!(theme.calories || theme.protein || theme.fats || theme.carbs);
  }

  onImageError(event: any): void {
    // Fallback to default image if image fails to load
    if (event && event.target) {
      event.target.src = 'assets/logo.jpg';
    }
  }

  retryLoad(): void {
    this.loadThemes();
  }

  trackByThemeId(index: number, theme: Theme): string {
    return theme._id || index.toString();
  }
}
