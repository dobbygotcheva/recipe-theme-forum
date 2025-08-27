import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { Theme } from 'src/app/shared/interfaces/theme';
import { User } from 'src/app/shared/interfaces/user';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  // Basic properties
  public themes: Theme[] = [];
  public users: User[] = [];
  public searchInput: string = '';
  public searchInput1: string = '';
  public searchType: 'recipes' | 'users' | 'all' = 'all';
  public categories: string[] = ['Закуски и тестени', 'Салати', 'Супички', 'Основни с месо', 'Основни без месо', 'Десерти', 'Напитки'];

  // Search results
  public filteredThemes: Theme[] = [];
  public filteredUsers: User[] = [];

  // Loading states
  public loadingThemes: boolean = false;
  public loadingUsers: boolean = false;

  // Sorting
  public selectedSort: string = 'newest';

  // Mock users for testing
  public mockUsers: User[] = [
    {
      _id: 'user1',
      username: 'chef_maria',
      email: 'maria@example.com',
      password: 'password',
      bio: 'Passionate chef with 10+ years of experience in Mediterranean cuisine',
      phone: '+359 888 111 111',
      role: 'user',
      themes: [],
      posts: [],
      created_at: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      _v: 0,
      preferences: {
        notifications: { email: true, push: true },
        privacy: { profilePublic: true, showEmail: true }
      }
    },
    {
      _id: 'user2',
      username: 'baking_pro',
      email: 'baker@example.com',
      password: 'password',
      bio: 'Professional baker specializing in pastries and breads',
      phone: '+359 888 222 222',
      role: 'user',
      themes: [],
      posts: [],
      created_at: '2024-02-20T14:30:00Z',
      updatedAt: '2024-02-20T14:30:00Z',
      _v: 0,
      preferences: {
        notifications: { email: true, push: true },
        privacy: { profilePublic: true, showEmail: false }
      }
    },
    {
      _id: 'user3',
      username: 'healthy_eats',
      email: 'healthy@example.com',
      password: 'password',
      bio: 'Nutritionist and healthy cooking enthusiast',
      phone: '+359 888 333 333',
      role: 'user',
      themes: [],
      posts: [],
      created_at: '2024-03-10T09:15:00Z',
      updatedAt: '2024-03-10T09:15:00Z',
      _v: 0,
      preferences: {
        notifications: { email: false, push: true },
        privacy: { profilePublic: true, showEmail: true }
      }
    }
  ];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadThemes();
    this.loadUsers();
  }

  public loadThemes(): void {
    this.loadingThemes = true;
    this.apiService.getThemes().subscribe({
      next: (themes) => {
        this.themes = themes;
        this.filteredThemes = themes;
        this.loadingThemes = false;
      },
      error: (err) => {
        console.error(`Error loading themes: ${err}`);
        this.loadingThemes = false;
      },
    });
  }

  public loadUsers(): void {
    this.loadingUsers = true;
    // Simulate API call delay
    setTimeout(() => {
      this.filteredUsers = this.mockUsers.filter(user =>
        user.username.toLowerCase().includes(this.searchInput1.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchInput1.toLowerCase())
      );
      this.loadingUsers = false;
    }, 500);
  }

  sortThemes() {
    if (!this.filteredThemes || this.filteredThemes.length === 0) {
      return;
    }

    try {
      const themesToSort = [...this.filteredThemes];

      switch (this.selectedSort) {
        case 'newest':
          themesToSort.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          break;

        case 'oldest':
          themesToSort.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB;
          });
          break;

        case 'rating-high':
          themesToSort.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          break;

        case 'rating-low':
          themesToSort.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
          break;

        case 'title-az':
          themesToSort.sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return titleA.localeCompare(titleB);
          });
          break;

        case 'title-za':
          themesToSort.sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return titleB.localeCompare(titleA);
          });
          break;

        case 'time-low':
          themesToSort.sort((a, b) => (a.time || 0) - (b.time || 0));
          break;

        case 'time-high':
          themesToSort.sort((a, b) => (b.time || 0) - (a.time || 0));
          break;

        case 'calories-low':
          themesToSort.sort((a, b) => (a.calories || 0) - (b.calories || 0));
          break;

        case 'calories-high':
          themesToSort.sort((a, b) => (b.calories || 0) - (a.calories || 0));
          break;

        case 'protein-high':
          themesToSort.sort((a, b) => (b.protein || 0) - (a.protein || 0));
          break;

        case 'carbs-low':
          themesToSort.sort((a, b) => (a.carbs || 0) - (b.carbs || 0));
          break;

        case 'fats-low':
          themesToSort.sort((a, b) => (a.fats || 0) - (b.fats || 0));
          break;

        default:
          break;
      }

      this.filteredThemes = themesToSort;
    } catch (error) {
      console.error('Error sorting themes:', error);
    }
  }

  hasNutritionalInfo(theme: any): boolean {
    return !!(theme.calories || theme.protein || theme.fats || theme.carbs);
  }

  getSortDisplayName(): string {
    const sortNames: { [key: string]: string } = {
      'newest': 'Най-нови',
      'oldest': 'Най-стари',
      'rating-high': 'Рейтинг (най-висок)',
      'rating-low': 'Рейтинг (най-нисък)',
      'title-az': 'Заглавие (А-Я)',
      'title-za': 'Заглавие (Я-А)',
      'time-low': 'Време (най-бързи)',
      'time-high': 'Време (най-бавни)',
      'calories-low': 'Калории (най-малко)',
      'calories-high': 'Калории (най-много)',
      'protein-high': 'Протеини (най-много)',
      'carbs-low': 'Въглехидрати (най-малко)',
      'fats-low': 'Мазнини (най-малко)'
    };
    return sortNames[this.selectedSort] || 'Най-нови';
  }

  public onSearchInputChange(): void {
    this.performSearch();
  }

  public onCategoryChange(): void {
    this.performSearch();
  }

  public onSearchTypeChange(): void {
    this.performSearch();
  }

  public performSearch(): void {
    // Search recipes
    if (this.searchType === 'recipes' || this.searchType === 'all') {
      this.filteredThemes = this.themes.filter(theme => {
        const matchesTitle = !this.searchInput ||
          theme.title.toLowerCase().includes(this.searchInput.toLowerCase());
        const matchesCategory = !this.searchInput1 ||
          theme.category.toLowerCase().includes(this.searchInput1.toLowerCase());
        return matchesTitle && matchesCategory;
      });
    }

    // Search users
    if (this.searchType === 'users' || this.searchType === 'all') {
      this.filteredUsers = this.users.filter(user => {
        if (!this.searchInput) return true;

        const searchTerm = this.searchInput.toLowerCase();
        return (
          user.username.toLowerCase().includes(searchTerm) ||
          user.bio?.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        );
      });
    }
  }

  public clearSearch(): void {
    this.searchInput = '';
    this.searchInput1 = '';
    this.performSearch();
  }

  public viewUserProfile(userId: string): void {
    window.open(`/user/${userId}`, '_blank');
  }

  public viewRecipe(recipeId: string): void {
    window.open(`/themes/${recipeId}`, '_blank');
  }

  public getAvatarUrl(user: User): string {
    if (user.avatar) {
      return user.avatar;
    }
    return 'assets/default-avatar.png';
  }

  public getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'moderator': return 'Модератор';
      case 'user': return 'Потребител';
      default: return 'Потребител';
    }
  }

  public onImageError(event: Event, defaultSrc: string): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = defaultSrc;
    }
  }
}
