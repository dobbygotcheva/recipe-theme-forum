import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  template: `
    <!-- 🚨 ADMIN PROFILE COMPONENT LOADED - THIS IS THE ADMIN PROFILE! 🚨 -->
    <div style="background-color: #ff0000; color: white; padding: 50px; text-align: center; font-size: 32px; font-weight: bold; border: 10px solid #00ff00; margin: 20px;">
      🚨 ADMIN PROFILE COMPONENT LOADED! 🚨
      <br><br>
      <p style="font-size: 18px;">If you can see this RED box, the AdminProfileComponent is working!</p>
      <br>
      <p style="font-size: 16px;">Current URL: {{ currentUrl }}</p>
      <p style="font-size: 16px;">Current Route: {{ currentRoute }}</p>
      <p style="font-size: 16px;">Component loaded at: {{ getCurrentTime() }}</p>
    </div>
    
    <div class="admin-profile-container">
      <div class="admin-profile-header">
        <h1>⚡ Админ Профил</h1>
        <p>Управление на административните функции</p>
      </div>

              <div class="admin-stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>Потребители</h3>
              <p class="stat-number">{{ userCount }}</p>
              <button (click)="showUsersSection()" class="stat-action">Управлявай</button>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
              <h3>Рецепти за модерация</h3>
              <p class="stat-number">{{ pendingRecipes }}</p>
              <button (click)="showModerationSection()" class="stat-action">Модерирай</button>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📰</div>
            <div class="stat-content">
              <h3>Новини</h3>
              <p class="stat-number">{{ newsCount }}</p>
              <button (click)="showNewsSection()" class="stat-action">Управлявай</button>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>Статистика</h3>
              <p class="stat-number">{{ totalRecipes }}</p>
              <button (click)="showStatsSection()" class="stat-action">Преглед</button>
            </div>
          </div>
        </div>

              <!-- Dynamic Admin Sections -->
        <div class="admin-sections">
          <!-- Users Management Section -->
          <div *ngIf="activeSection === 'users'" class="admin-section">
            <h2>👥 Управление на Потребители</h2>
            <div class="users-list">
              <div *ngFor="let user of users" class="user-item">
                <div class="user-info">
                  <strong>{{ user.username }}</strong> ({{ user.email }})
                  <span class="user-role">{{ user.role }}</span>
                </div>
                <div class="user-actions">
                  <button (click)="changeUserRole(user._id, user.role === 'admin' ? 'user' : 'admin')" 
                          class="role-btn">
                    {{ user.role === 'admin' ? 'Премахни админ' : 'Направи админ' }}
                  </button>
                  <button (click)="deleteUser(user._id)" class="delete-btn">Изтрий</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recipe Moderation Section -->
          <div *ngIf="activeSection === 'moderation'" class="admin-section">
            <h2>📝 Модерация на Рецепти</h2>
            <div class="recipes-list">
              <div *ngFor="let recipe of pendingRecipesList" class="recipe-item">
                <div class="recipe-info">
                  <h3>{{ recipe.title }}</h3>
                  <p><strong>Автор:</strong> {{ recipe.author?.username || recipe.author }}</p>
                  <p><strong>Категория:</strong> {{ recipe.category }}</p>
                  <p><strong>Време:</strong> {{ recipe.time }} мин</p>
                </div>
                <div class="recipe-actions">
                  <button (click)="approveRecipe(recipe._id)" class="approve-btn">✅ Одобри</button>
                  <button (click)="rejectRecipe(recipe._id)" class="reject-btn">❌ Отхвърли</button>
                  <button (click)="deleteRecipe(recipe._id)" class="delete-btn">🗑️ Изтрий</button>
                </div>
              </div>
            </div>
          </div>

          <!-- News Management Section -->
          <div *ngIf="activeSection === 'news'" class="admin-section">
            <h2>📰 Управление на Новини</h2>
            <div class="news-form">
              <h3>Добави новина</h3>
              <input [(ngModel)]="newNewsTitle" placeholder="Заглавие на новината" class="news-input">
              <textarea [(ngModel)]="newNewsContent" placeholder="Съдържание на новината" class="news-textarea"></textarea>
              <button (click)="addNews()" class="add-news-btn">➕ Добави новина</button>
            </div>
            <div class="news-list">
              <div *ngFor="let news of newsList" class="news-item">
                <h4>{{ news.title }}</h4>
                <p>{{ news.content }}</p>
                <button (click)="deleteNews(news._id)" class="delete-btn">🗑️ Изтрий</button>
              </div>
            </div>
          </div>

          <!-- Statistics Section -->
          <div *ngIf="activeSection === 'stats'" class="admin-section">
            <h2>📊 Статистика на системата</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <h3>Общо потребители</h3>
                <p class="stat-number">{{ userCount }}</p>
              </div>
              <div class="stat-box">
                <h3>Общо рецепти</h3>
                <p class="stat-number">{{ totalRecipes }}</p>
              </div>
              <div class="stat-box">
                <h3>Чакащи одобрение</h3>
                <p class="stat-number">{{ pendingRecipes }}</p>
              </div>
              <div class="stat-box">
                <h3>Общо новини</h3>
                <p class="stat-number">{{ newsCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-actions">
          <h2>🚀 Админ Действия</h2>
          
          <div class="action-buttons">
            <button (click)="showUsersSection()" class="admin-btn users-btn">
              👥 Управление на Потребители
            </button>
            
            <button (click)="showModerationSection()" class="admin-btn moderation-btn">
              📝 Модерация на Рецепти
            </button>
            
            <button (click)="showNewsSection()" class="admin-btn news-btn">
              📰 Управление на Новини
            </button>
          </div>
        </div>

      <div class="admin-info">
        <h2>ℹ️ Админ Информация</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Потребителско име:</strong> {{ currentUser?.username }}
          </div>
          <div class="info-item">
            <strong>Имейл:</strong> {{ currentUser?.email }}
          </div>
          <div class="info-item">
            <strong>Роля:</strong> {{ currentUser?.role }}
          </div>
          <div class="info-item">
            <strong>Регистриран на:</strong> {{ currentUser?.created_at?.substring(0, 10) }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .admin-profile-header {
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .admin-profile-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
    }

    .admin-profile-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .admin-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin: 0 0 0.5rem 0;
    }

    .stat-action {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .stat-action:hover {
      background: #5a6fd8;
    }

    .admin-actions {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .admin-actions h2 {
      color: #2c3e50;
      margin: 0 0 1.5rem 0;
      text-align: center;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .admin-btn {
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      text-align: left;
    }

    .users-btn {
      background: rgba(52, 152, 219, 0.1);
      color: #3498db;
      border: 2px solid #3498db;
    }

    .users-btn:hover {
      background: rgba(52, 152, 219, 0.2);
      transform: translateY(-2px);
    }

    .moderation-btn {
      background: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
      border: 2px solid #e74c3c;
    }

    .moderation-btn:hover {
      background: rgba(231, 76, 60, 0.2);
      transform: translateY(-2px);
    }

    .news-btn {
      background: rgba(39, 174, 96, 0.1);
      color: #27ae60;
      border: 2px solid #27ae60;
    }

    .news-btn:hover {
      background: rgba(39, 174, 96, 0.2);
      transform: translateY(-2px);
    }

    .dashboard-btn {
      background: rgba(155, 89, 182, 0.1);
      color: #9b59b6;
      border: 2px solid #9b59b6;
    }

    .dashboard-btn:hover {
      background: rgba(155, 89, 182, 0.2);
      transform: translateY(-2px);
    }

    .admin-info {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .admin-info h2 {
      color: #2c3e50;
      margin: 0 0 1.5rem 0;
      text-align: center;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #667eea;
    }

    .admin-sections {
      margin-top: 2rem;
    }

    .admin-section {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .users-list, .recipes-list, .news-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .user-item, .recipe-item, .news-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #667eea;
    }

    .user-info, .recipe-info, .news-item h4 {
      flex: 1;
    }

    .user-role {
      background: #667eea;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 15px;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }

    .user-actions, .recipe-actions {
      display: flex;
      gap: 0.5rem;
    }

    .role-btn, .approve-btn, .reject-btn, .delete-btn, .add-news-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .role-btn {
      background: #3498db;
      color: white;
    }

    .approve-btn {
      background: #27ae60;
      color: white;
    }

    .reject-btn {
      background: #e74c3c;
      color: white;
    }

    .delete-btn {
      background: #95a5a6;
      color: white;
    }

    .add-news-btn {
      background: #9b59b6;
      color: white;
      margin-top: 1rem;
    }

    .news-form {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .news-input, .news-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      margin-bottom: 1rem;
      font-family: inherit;
    }

    .news-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-box {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 10px;
      text-align: center;
      border-left: 4px solid #667eea;
    }

    .stat-box h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .admin-profile-container {
        padding: 1rem;
      }
      
      .admin-stats-grid {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        grid-template-columns: 1fr;
      }

      .user-item, .recipe-item, .news-item {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  userCount = 0;
  pendingRecipes = 0;
  newsCount = 0;
  totalRecipes = 0;
  activeSection: string = '';
  users: any[] = [];
  pendingRecipesList: any[] = [];
  newsList: any[] = [];
  newNewsTitle: string = '';
  newNewsContent: string = '';
  currentUrl: string = '';
  currentRoute: string = '';

  constructor(private http: HttpClient, private router: Router) {
    console.log('🔧 AdminProfileComponent constructor called');
  }

  ngOnInit() {
    console.log('🎯 AdminProfileComponent ngOnInit() called');
    console.log('🔍 Component selector:', 'app-admin-profile');
    console.log('🔍 Component location:', 'admin-profile.component.ts');

    this.currentUrl = window.location.href;
    this.currentRoute = this.router.url;
    console.log('🔍 Current URL:', this.currentUrl);
    console.log('🔍 Current route:', this.currentRoute);

    this.checkAdminRole();
    this.loadAdminStats();
  }

  checkAdminRole() {
    console.log('🔍 AdminProfileComponent - checkAdminRole() called');

    const userStr = localStorage.getItem('currentUser');
    console.log('🔍 localStorage currentUser:', userStr);

    if (!userStr) {
      console.log('❌ No currentUser in localStorage, redirecting to admin login');
      this.router.navigate(['/admin/login']);
      return;
    }

    this.currentUser = JSON.parse(userStr);
    console.log('🔍 Parsed currentUser:', this.currentUser);
    console.log('🔍 User role:', this.currentUser.role);

    if (this.currentUser.role !== 'admin') {
      console.log('❌ User role is not admin, redirecting to admin login');
      this.router.navigate(['/admin/login']);
      return;
    }

    console.log('✅ Admin role check passed');
  }

  ngOnDestroy() {
    console.log('🗑️ AdminProfileComponent destroyed');
  }

  getCurrentTime(): string {
    return new Date().toLocaleString();
  }

  loadAdminStats() {
    // Load user count
    this.http.get('/api/admin/users').subscribe({
      next: (users: any) => {
        this.userCount = users.length;
        this.users = users;
      },
      error: () => {
        this.userCount = 0;
        this.users = [];
      }
    });

    // Load pending recipes count
    this.http.get('/api/admin/themes').subscribe({
      next: (themes: any) => {
        this.pendingRecipes = themes.filter((t: any) => t.status === 'pending').length;
        this.totalRecipes = themes.length;
        this.pendingRecipesList = themes.filter((t: any) => t.status === 'pending');
      },
      error: () => {
        this.pendingRecipes = 0;
        this.totalRecipes = 0;
        this.pendingRecipesList = [];
      }
    });

    // Load news count
    this.http.get('/api/admin/news').subscribe({
      next: (news: any) => {
        this.newsCount = news.length;
        this.newsList = news;
      },
      error: () => {
        this.newsCount = 0;
        this.newsList = [];
      }
    });
  }

  // Section display methods
  showUsersSection() {
    this.activeSection = 'users';
  }

  showModerationSection() {
    this.activeSection = 'moderation';
  }

  showNewsSection() {
    this.activeSection = 'news';
  }

  showStatsSection() {
    this.activeSection = 'stats';
  }

  // User management methods
  changeUserRole(userId: string, newRole: string) {
    this.http.put(`/api/admin/users/${userId}/role`, { role: newRole }).subscribe({
      next: () => {
        this.loadAdminStats(); // Reload data
      },
      error: (err) => {
        console.error('Error changing user role:', err);
      }
    });
  }

  deleteUser(userId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете този потребител?')) {
      this.http.delete(`/api/admin/users/${userId}`).subscribe({
        next: () => {
          this.loadAdminStats(); // Reload data
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  // Recipe moderation methods
  approveRecipe(recipeId: string) {
    this.http.put(`/api/admin/themes/${recipeId}/approve`, {}).subscribe({
      next: () => {
        this.loadAdminStats(); // Reload data
      },
      error: (err) => {
        console.error('Error approving recipe:', err);
      }
    });
  }

  rejectRecipe(recipeId: string) {
    this.http.put(`/api/admin/themes/${recipeId}/reject`, {}).subscribe({
      next: () => {
        this.loadAdminStats(); // Reload data
      },
      error: (err) => {
        console.error('Error rejecting recipe:', err);
      }
    });
  }

  deleteRecipe(recipeId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете тази рецепта?')) {
      this.http.delete(`/api/admin/themes/${recipeId}`).subscribe({
        next: () => {
          this.loadAdminStats(); // Reload data
        },
        error: (err) => {
          console.error('Error deleting recipe:', err);
        }
      });
    }
  }

  // News management methods
  addNews() {
    if (this.newNewsTitle && this.newNewsContent) {
      this.http.post('/api/admin/news', {
        title: this.newNewsTitle,
        content: this.newNewsContent
      }).subscribe({
        next: () => {
          this.newNewsTitle = '';
          this.newNewsContent = '';
          this.loadAdminStats(); // Reload data
        },
        error: (err) => {
          console.error('Error adding news:', err);
        }
      });
    }
  }

  deleteNews(newsId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете тази новина?')) {
      this.http.delete(`/api/admin/news/${newsId}`).subscribe({
        next: () => {
          this.loadAdminStats(); // Reload data
        },
        error: (err) => {
          console.error('Error deleting news:', err);
        }
      });
    }
  }


}
