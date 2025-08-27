import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  template: `
    <div class="user-profile">
      <!-- Profile Header -->
      <header class="profile-header">
        <div class="header-content">
          <div class="profile-brand">
            <div class="profile-icon">👤</div>
            <div class="brand-info">
              <h1>Моят Профил</h1>
              <p>Управлявайте вашия акаунт и рецепти</p>
            </div>
          </div>
          
          <div class="profile-user">
            <span>Потребител: {{ currentUser?.username }}</span>
            <button (click)="logout()" class="logout-btn">🚪 Изход</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <!-- Profile Info Section -->
        <div class="profile-section">
          <h2>📋 Информация за профила</h2>
          
          <div class="profile-card">
            <div class="profile-info">
              <div class="info-row">
                <span class="label">👤 Потребителско име:</span>
                <span class="value">{{ currentUser?.username }}</span>
              </div>
              <div class="info-row">
                <span class="label">📧 Email:</span>
                <span class="value">{{ currentUser?.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">📅 Регистриран на:</span>
                <span class="value">{{ formatDate(currentUser?.created_at) }}</span>
              </div>
              <div class="info-row">
                <span class="label">🏷️ Роля:</span>
                <span class="value role-badge" [class]="'role-' + currentUser?.role">
                  {{ getRoleText(currentUser?.role) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- My Recipes Section -->
        <div class="recipes-section">
          <div class="section-header">
            <h2>📝 Моите рецепти</h2>
            <button (click)="createNewRecipe()" class="create-btn">➕ Нова рецепта</button>
          </div>

          <div *ngIf="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Зареждане на рецепти...</p>
          </div>

          <div *ngIf="!loading && myRecipes.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Нямате рецепти</h3>
            <p>Създайте първата си рецепта!</p>
            <button (click)="createNewRecipe()" class="create-btn">➕ Създайте рецепта</button>
          </div>

          <div *ngIf="!loading && myRecipes.length > 0" class="recipes-grid">
            <div *ngFor="let recipe of myRecipes" class="recipe-card" [class]="'status-' + recipe.status">
              <div class="recipe-header">
                <h3>{{ recipe.title }}</h3>
                <span class="status-badge" [class]="'status-' + recipe.status">
                  {{ getStatusText(recipe.status) }}
                </span>
              </div>
              
              <div class="recipe-content">
                <p class="recipe-description">{{ recipe.description }}</p>
                <div class="recipe-meta">
                  <span class="category">🏷️ {{ recipe.category }}</span>
                  <span class="date">📅 {{ formatDate(recipe.created_at) }}</span>
                </div>
              </div>

              <div class="recipe-actions">
                <button 
                  (click)="viewRecipe(recipe._id)" 
                  class="action-btn view-btn"
                >
                  👁️ Преглед
                </button>
                
                <button 
                  (click)="editRecipe(recipe._id)" 
                  class="action-btn edit-btn"
                >
                  ✏️ Редактирай
                </button>
                
                <button 
                  (click)="deleteRecipe(recipe._id)" 
                  class="action-btn delete-btn"
                >
                  🗑️ Изтрий
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Actions Section -->
        <div class="account-section">
          <h2>⚙️ Настройки на акаунта</h2>
          
          <div class="account-actions">
            <button (click)="changePassword()" class="account-btn password-btn">
              🔐 Промени парола
            </button>
            
            <button (click)="editProfile()" class="account-btn edit-btn">
              ✏️ Редактирай профил
            </button>
            
            <button (click)="deleteAccount()" class="account-btn delete-btn">
              🗑️ Изтрий акаунт
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .user-profile {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .profile-icon {
      font-size: 2.5rem;
    }

    .brand-info h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .brand-info p {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .profile-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logout-btn {
      background: rgba(231, 76, 60, 0.2);
      border: 1px solid #e74c3c;
      color: #e74c3c;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(231, 76, 60, 0.3);
      transform: translateY(-2px);
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-section, .recipes-section, .account-section {
      margin-bottom: 3rem;
    }

    .profile-section h2, .recipes-section h2, .account-section h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .profile-card {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #2c3e50;
    }

    .value {
      color: #7f8c8d;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.role-admin {
      background: rgba(243, 156, 18, 0.2);
      color: #f39c12;
    }

    .role-badge.role-user {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .create-btn {
      background: rgba(39, 174, 96, 0.2);
      border: 1px solid #27ae60;
      color: #27ae60;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .create-btn:hover {
      background: rgba(39, 174, 96, 0.3);
      transform: translateY(-2px);
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
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

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .recipe-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-left: 4px solid #ddd;
    }

    .recipe-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .recipe-card.status-pending {
      border-left-color: #f39c12;
    }

    .recipe-card.status-approved {
      border-left-color: #27ae60;
    }

    .recipe-card.status-rejected {
      border-left-color: #e74c3c;
    }

    .recipe-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .recipe-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.3rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.status-pending {
      background: rgba(243, 156, 18, 0.2);
      color: #f39c12;
    }

    .status-badge.status-approved {
      background: rgba(39, 174, 96, 0.2);
      color: #27ae60;
    }

    .status-badge.status-rejected {
      background: rgba(231, 76, 60, 0.2);
      color: #e74c3c;
    }

    .recipe-content {
      margin-bottom: 1.5rem;
    }

    .recipe-description {
      color: #7f8c8d;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .recipe-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #95a5a6;
    }

    .recipe-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .view-btn {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
    }

    .view-btn:hover {
      background: rgba(52, 152, 219, 0.3);
      transform: translateY(-2px);
    }

    .edit-btn {
      background: rgba(243, 156, 18, 0.2);
      color: #f39c12;
    }

    .edit-btn:hover {
      background: rgba(243, 156, 18, 0.3);
      transform: translateY(-2px);
    }

    .delete-btn {
      background: rgba(231, 76, 60, 0.2);
      color: #e74c3c;
    }

    .delete-btn:hover {
      background: rgba(231, 76, 60, 0.3);
      transform: translateY(-2px);
    }

    .account-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .account-btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .password-btn {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
    }

    .password-btn:hover {
      background: rgba(52, 152, 219, 0.3);
      transform: translateY(-2px);
    }

    .account-btn.edit-btn {
      background: rgba(243, 156, 18, 0.2);
      color: #f39c12;
    }

    .account-btn.edit-btn:hover {
      background: rgba(243, 156, 18, 0.3);
      transform: translateY(-2px);
    }

    .account-btn.delete-btn {
      background: rgba(231, 76, 60, 0.2);
      color: #e74c3c;
    }

    .account-btn.delete-btn:hover {
      background: rgba(231, 76, 60, 0.3);
      transform: translateY(-2px);
    }
  `]
})
export class UserProfileComponent implements OnInit {
  currentUser: any = null;
  myRecipes: any[] = [];
  loading = true;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadMyRecipes();
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }

    // Verify user is still authenticated
    this.http.get('/api/users/profile').subscribe({
      next: (user: any) => {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  loadMyRecipes() {
    this.http.get('/api/themes/my-recipes').subscribe({
      next: (data: any) => {
        this.myRecipes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading my recipes:', err);
        this.loading = false;
      }
    });
  }

  createNewRecipe() {
    // Navigate to recipe creation page (to be implemented)
    alert('Функцията за създаване на рецепта ще бъде добавена скоро!');
  }

  viewRecipe(recipeId: string) {
    this.router.navigate(['/theme', recipeId]);
  }

  editRecipe(recipeId: string) {
    // Navigate to recipe editing page (to be implemented)
    alert('Функцията за редактиране на рецепта ще бъде добавена скоро!');
  }

  deleteRecipe(recipeId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете тази рецепта?')) {
      this.http.delete(`/api/themes/${recipeId}`).subscribe({
        next: () => {
          this.loadMyRecipes();
        },
        error: (err) => {
          console.error('Error deleting recipe:', err);
          alert('Грешка при изтриване на рецептата');
        }
      });
    }
  }

  changePassword() {
    // Implement password change functionality (to be implemented)
    alert('Функцията за промяна на парола ще бъде добавена скоро!');
  }

  editProfile() {
    // Implement profile editing functionality (to be implemented)
    alert('Функцията за редактиране на профил ще бъде добавена скоро!');
  }

  deleteAccount() {
    if (confirm('Сигурни ли сте, че искате да изтриете вашия акаунт? Това действие не може да бъде отменено.')) {
      this.http.delete('/api/users/profile').subscribe({
        next: () => {
          localStorage.removeItem('currentUser');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error deleting account:', err);
          alert('Грешка при изтриване на акаунта');
        }
      });
    }
  }

  getRoleText(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Администратор',
      'user': 'Потребител'
    };
    return roleMap[role] || 'Неизвестна';
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

  logout() {
    this.http.post('/api/logout', {}).subscribe({
      next: () => {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/']);
      },
      error: () => {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/']);
      }
    });
  }
}
