import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-themes-page',
  template: `
    <div class="themes-container">
      <div class="page-header">
        <h1 class="page-title">🍽️ Рецепти</h1>
        <p class="page-subtitle">Открийте вкусни рецепти от нашата общност</p>
        <button *ngIf="currentUser" (click)="createRecipe()" class="create-recipe-btn">
          📝 Създай рецепта
        </button>
      </div>
      
      <!-- Sorting Controls -->
      <div class="sorting-section" *ngIf="themes && themes.length > 0">
        <div class="sorting-controls">
          <label for="sort-select">🔀 Сортирай по:</label>
          <select id="sort-select" [(ngModel)]="selectedSort" (change)="sortThemes()" class="sort-select">
            <option value="newest">📅 Най-нови</option>
            <option value="oldest">📅 Най-стари</option>
            <option value="rating-high">⭐ Рейтинг (най-висок)</option>
            <option value="rating-low">⭐ Рейтинг (най-нисък)</option>
            <option value="title-az">📝 Заглавие (А-Я)</option>
            <option value="title-za">📝 Заглавие (Я-А)</option>
            <option value="time-low">⏰ Време (най-бързи)</option>
            <option value="time-high">⏰ Време (най-бавни)</option>
            <option value="calories-low">🔥 Калории (най-малко)</option>
            <option value="calories-high">🔥 Калории (най-много)</option>
            <option value="protein-high">💪 Протеини (най-много)</option>
            <option value="carbs-low">🍞 Въглехидрати (най-малко)</option>
            <option value="fats-low">🥑 Мазнини (най-малко)</option>
          </select>
        </div>
        
        <div class="sorting-info">
          <span class="recipe-count">📊 Показване на {{ themes.length }} рецепти</span>
          <span class="current-sort">🔀 Сортирано по: {{ getSortDisplayName() }}</span>
        </div>
      </div>
      
      <div *ngIf="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p>Зареждане на рецепти...</p>
      </div>
      
      <div *ngIf="error" class="error-section">
        <div class="error-icon">❌</div>
        <h3>Възникна грешка</h3>
        <p>{{ error }}</p>
        <button (click)="loadThemes()" class="retry-button">Опитайте отново</button>
      </div>
      
      <div *ngIf="themes && themes.length > 0" class="themes-grid">
        <div *ngFor="let theme of themes" class="theme-card">
          <div class="card-header">
            <img [src]="theme.img" [alt]="theme.title" class="theme-image" />
            <div class="theme-category">{{ theme.category }}</div>
          </div>
          
          <div class="card-content">
            <h3 class="theme-title">{{ theme.title }}</h3>
            <p class="theme-description">{{ theme.ingredients | slice:100 }}</p>
            
            <div class="theme-meta">
              <div class="meta-item">
                <span class="meta-icon">⏰</span>
                <span>{{ theme.time }} мин</span>
              </div>
              
              <div class="meta-item" *ngIf="theme.averageRating">
                <span class="meta-icon">⭐</span>
                <span>{{ theme.averageRating | number:'1.1-1' }} ({{ theme.totalRatings }})</span>
              </div>
            </div>
            
            <!-- Nutritional Information Display -->
            <div class="nutritional-info" *ngIf="hasNutritionalInfo(theme)">
              <h4>🥗 Хранителна информация</h4>
              <div class="nutritional-grid">
                <div class="nutrition-item" *ngIf="theme.calories">
                  <span class="nutrition-icon">🔥</span>
                  <span class="nutrition-value">{{ theme.calories }} kcal</span>
                </div>
                <div class="nutrition-item" *ngIf="theme.protein">
                  <span class="nutrition-icon">💪</span>
                  <span class="nutrition-value">{{ theme.protein }}g протеини</span>
                </div>
                <div class="nutrition-item" *ngIf="theme.fats">
                  <span class="nutrition-icon">🥑</span>
                  <span class="nutrition-value">{{ theme.fats }}g мазнини</span>
                </div>
                <div class="nutrition-item" *ngIf="theme.carbs">
                  <span class="nutrition-icon">🍞</span>
                  <span class="nutrition-value">{{ theme.carbs }}g въглехидрати</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <button (click)="viewRecipe(theme._id)" class="view-recipe-btn">Виж рецептата</button>
          </div>
        </div>
      </div>
      
      <div *ngIf="themes && themes.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>Няма рецепти</h3>
        <p>Все още няма добавени рецепти. Бъдете първите!</p>
      </div>
    </div>
  `,
  styles: [`
    .themes-container {
      padding: 2rem 0;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-title {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-weight: 300;
    }

    .page-subtitle {
      font-size: 1.2rem;
      color: #7f8c8d;
      margin-bottom: 1rem;
    }

    .create-recipe-btn {
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
    }

    .create-recipe-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
    }

    /* Sorting Section Styles */
    .sorting-section {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
    }

    .sorting-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .sorting-controls label {
      font-weight: 600;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .sort-select {
      padding: 0.75rem 1rem;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      background: white;
      font-size: 1rem;
      cursor: pointer;
      transition: border-color 0.3s ease;
      min-width: 200px;
    }

    .sort-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .sorting-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .recipe-count, .current-sort {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loading-section {
      text-align: center;
      padding: 3rem 0;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-section {
      text-align: center;
      padding: 3rem 0;
      background: white;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .retry-button {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .retry-button:hover {
      background: #c0392b;
    }

    .themes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .theme-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 1px solid #e9ecef;
    }

    .theme-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .card-header {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .theme-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .theme-card:hover .theme-image {
      transform: scale(1.05);
    }

    .theme-category {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(102, 126, 234, 0.9);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .card-content {
      padding: 1.5rem;
    }

    .theme-title {
      font-size: 1.4rem;
      color: #2c3e50;
      margin-bottom: 0.8rem;
      font-weight: 600;
    }

    .theme-description {
      color: #7f8c8d;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .theme-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .meta-icon {
      font-size: 1rem;
    }

    /* Nutritional Information Styles */
    .nutritional-info {
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e9ecef;
    }

    .nutritional-info h4 {
      margin: 0 0 0.8rem 0;
      color: #2c3e50;
      font-size: 1rem;
      font-weight: 600;
    }

    .nutritional-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.8rem;
    }

    .nutrition-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .nutrition-icon {
      font-size: 1.2rem;
    }

    .nutrition-value {
      font-size: 0.85rem;
      color: #495057;
      font-weight: 500;
    }

    .card-footer {
      padding: 0 1.5rem 1.5rem;
    }

    .view-recipe-btn {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.8rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .view-recipe-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 0;
      background: white;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .themes-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      
      .page-title {
        font-size: 2rem;
      }

      .sorting-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .sort-select {
        min-width: auto;
        width: 100%;
      }

      .sorting-info {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }
  `]
})
export class ThemesPageComponent implements OnInit {
  themes: any[] = [];
  originalThemes: any[] = []; // Keep original list for sorting
  loading = false;
  error = '';
  currentUser: any = null;
  selectedSort: string = 'newest';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadThemes();
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  loadThemes() {
    this.loading = true;
    this.error = '';

    this.http.get<any[]>('/api/themes').subscribe({
      next: (data) => {
        this.themes = data;
        this.originalThemes = [...data]; // Keep a copy for sorting
        this.loading = false;
        this.sortThemes(); // Apply default sorting
        console.log('Themes loaded:', data);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Неуспешно зареждане на рецептите';
        console.error('Error loading themes:', err);
      }
    });
  }

  sortThemes() {
    if (!this.themes || this.themes.length === 0) {
      return;
    }

    try {
      // Create a copy of the original list for sorting
      const themesToSort = [...this.originalThemes];

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
          // Keep original order
          break;
      }

      this.themes = themesToSort;
    } catch (error) {
      console.error('Error sorting themes:', error);
      // Fallback to original list if sorting fails
      this.themes = [...this.originalThemes];
    }
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

  hasNutritionalInfo(theme: any): boolean {
    return !!(theme.calories || theme.protein || theme.fats || theme.carbs);
  }

  viewRecipe(recipeId: string) {
    this.router.navigate(['/theme', recipeId]);
  }

  createRecipe() {
    this.router.navigate(['/create-recipe']);
  }
}