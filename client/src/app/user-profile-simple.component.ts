import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileManagementComponent } from './shared/components/profile-management/profile-management.component';
import { User } from './shared/interfaces/user';
import { UserService } from './user/user.service';

@Component({
  selector: 'app-user-profile-simple',
  template: `
    <div class="user-profile">
      <!-- Profile Header -->
      <header class="profile-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="profile-brand">
            <div class="profile-avatar-container">
              <img [src]="getAvatarUrl()" alt="Profile Avatar" class="header-avatar" />
            </div>
            <div class="brand-info">
              <h1>👋 Здравейте, {{ currentUser?.username }}!</h1>
              <p>Управлявайте вашия акаунт и рецепти</p>
              <div class="user-stats">
                <span class="stat-item">
                  <span class="stat-icon">📝</span>
                  <span class="stat-value">{{ myRecipes.length }}</span>
                  <span class="stat-label">Рецепти</span>
                </span>
                <span class="stat-item">
                  <span class="stat-icon">❤️</span>
                  <span class="stat-value">{{ favoriteRecipes.length }}</span>
                  <span class="stat-label">Любими</span>
                </span>
                <span class="stat-item">
                  <span class="stat-icon">👍</span>
                  <span class="stat-value">{{ likedRecipes.length }}</span>
                  <span class="stat-label">Харесани</span>
                </span>
              </div>
            </div>
          </div>
          
          <div class="profile-actions">
            <button (click)="logout()" class="logout-btn">
              <span class="btn-icon">🚪</span>
              <span class="btn-text">Изход</span>
            </button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <!-- Profile Info Section -->
        <section class="profile-section">
          <div class="section-header">
            <h2>📋 Информация за профила</h2>
            <p>Вашите основни данни и настройки</p>
          </div>
          
          <div class="profile-card">
            <div class="card-header">
              <span class="card-icon">👤</span>
              <h3>Данни за акаунта</h3>
            </div>
            <div class="profile-info">
              <div class="info-row">
                <div class="info-label">
                  <span class="label-icon">👤</span>
                  <span class="label-text">Потребителско име</span>
                </div>
                <span class="info-value">{{ currentUser?.username }}</span>
              </div>
              <div class="info-row">
                <div class="info-label">
                  <span class="label-icon">📧</span>
                  <span class="label-text">Email адрес</span>
                </div>
                <span class="info-value">{{ currentUser?.email }}</span>
              </div>
              <div class="info-row">
                <div class="info-label">
                  <span class="label-icon">📅</span>
                  <span class="label-text">Регистриран на</span>
                </div>
                <span class="info-value">{{ formatDate(currentUser?.created_at) }}</span>
              </div>
              <div class="info-row">
                <div class="info-label">
                  <span class="label-icon">🏷️</span>
                  <span class="label-text">Роля</span>
                </div>
                <span class="role-badge" [class]="'role-' + currentUser?.role">
                  {{ getRoleText(currentUser?.role) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Profile Management Component -->
        <section class="profile-section">
          <div class="section-header">
            <h2>⚙️ Управление на профила</h2>
            <p>Променете вашите данни и настройки</p>
          </div>
          <app-profile-management
            [user]="currentUser"
            (profileUpdated)="onProfileUpdated($event)"
            (passwordChanged)="onPasswordChanged($event)"
            (avatarUploaded)="onAvatarUploaded($event)"
          ></app-profile-management>
        </section>

        <!-- Recipe Management Component -->
        <section class="profile-section">
          <div class="section-header">
            <h2>🍳 Моите рецепти</h2>
            <p>Управлявайте вашите създадени рецепти</p>
          </div>
          <app-recipe-management
            [recipes]="myRecipes"
            (recipeDeleted)="onRecipeDeleted($event)"
          ></app-recipe-management>
        </section>

        <!-- Favorite Recipes Component -->
        <section class="profile-section">
          <div class="section-header">
            <h2>❤️ Любими рецепти</h2>
            <p>Вашите запазени рецепти</p>
          </div>
          <app-favorites-display
            [recipes]="favoriteRecipes"
            title=""
            emptyMessage="Нямате любими рецепти"
            [showRemoveButton]="true"
            (recipeRemoved)="onRecipeRemovedFromFavorites($event)"
          ></app-favorites-display>
        </section>

        <!-- Liked Recipes Component -->
        <section class="profile-section">
          <div class="section-header">
            <h2>👍 Харесани рецепти</h2>
            <p>Рецептите, които сте харесали</p>
          </div>
          <app-favorites-display
            [recipes]="likedRecipes"
            title=""
            emptyMessage="Нямате харесани рецепти"
            [showRemoveButton]="false"
          ></app-favorites-display>
        </section>

        <!-- Account Actions Section -->
        <section class="profile-section">
          <div class="section-header">
            <h2>⚠️ Опасни операции</h2>
            <p>Действия, които не могат да бъдат отменени</p>
          </div>
          
          <div class="danger-zone">
            <div class="danger-card">
              <div class="danger-header">
                <span class="danger-icon">🗑️</span>
                <div class="danger-info">
                  <h3>Изтриване на акаунт</h3>
                  <p>Това действие ще изтрие завинаги вашия акаунт и всички данни</p>
                </div>
              </div>
              <button (click)="deleteAccount()" class="danger-btn">
                <span class="btn-icon">🗑️</span>
                <span class="btn-text">Изтрий акаунт</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .user-profile {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .profile-header {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      overflow: hidden;
    }

    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .header-content {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      max-width: 1200px;
      margin: 0 auto;
      gap: 2rem;
    }

    .profile-brand {
      display: flex;
      align-items: flex-start;
      gap: 2rem;
      flex: 1;
    }

    .profile-avatar-container {
      position: relative;
      flex-shrink: 0;
    }

    .header-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    }

    .header-avatar:hover {
      transform: scale(1.05);
      border-color: rgba(255, 255, 255, 0.5);
    }

    /* Avatar status indicator removed */

    .brand-info h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .brand-info p {
      margin: 0 0 1.5rem 0;
      opacity: 0.9;
      font-size: 1.1rem;
      font-weight: 300;
    }

    .user-stats {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .stat-item:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
    }

    .stat-label {
      font-size: 0.8rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .profile-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(231, 76, 60, 0.2);
      border: 1px solid rgba(231, 76, 60, 0.5);
      color: #fff;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-weight: 600;
    }

    .logout-btn:hover {
      background: rgba(231, 76, 60, 0.4);
      border-color: rgba(231, 76, 60, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(231, 76, 60, 0.3);
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    .profile-section {
      margin-bottom: 3rem;
    }

    .section-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .section-header h2 {
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .section-header p {
      color: #7f8c8d;
      margin: 0;
      font-size: 1.1rem;
      font-weight: 300;
    }

    .profile-card, .danger-card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .profile-card:hover, .danger-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8f9fa;
    }

    .card-icon {
      font-size: 2rem;
    }

    .card-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #f8f9fa;
      transition: all 0.3s ease;
    }

    .info-row:hover {
      background: #f8f9fa;
      margin: 0 -1rem;
      padding: 1rem;
      border-radius: 10px;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .label-icon {
      font-size: 1.2rem;
    }

    .label-text {
      font-weight: 600;
      color: #2c3e50;
      font-size: 1rem;
    }

    .info-value {
      color: #7f8c8d;
      font-weight: 500;
      font-size: 1rem;
    }

    .role-badge {
      padding: 0.5rem 1rem;
      border-radius: 25px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-badge.role-admin {
      background: linear-gradient(135deg, #f39c12, #e67e22);
      color: white;
      box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
    }

    .role-badge.role-user {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    }

    .danger-zone {
      margin-top: 2rem;
    }

    .danger-card {
      background: linear-gradient(135deg, #fff5f5, #fed7d7);
      border: 1px solid #fed7d7;
    }

    .danger-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .danger-icon {
      font-size: 2rem;
    }

    .danger-info h3 {
      margin: 0 0 0.5rem 0;
      color: #c53030;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .danger-info p {
      margin: 0;
      color: #742a2a;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .danger-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #e53e3e, #c53030);
      border: none;
      color: white;
      padding: 1rem 2rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(197, 48, 48, 0.3);
    }

    .danger-btn:hover {
      background: linear-gradient(135deg, #c53030, #a52a2a);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(197, 48, 48, 0.4);
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    .btn-text {
      font-weight: 600;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 2rem;
      }

      .profile-brand {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .brand-info h1 {
        font-size: 2rem;
      }

      .user-stats {
        justify-content: center;
        flex-wrap: wrap;
      }

      .main-content {
        padding: 2rem 1rem;
      }

      .profile-card, .danger-card {
        padding: 1.5rem;
      }

      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .info-label {
        justify-content: center;
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .profile-header {
        padding: 2rem 1rem;
      }

      .header-avatar {
        width: 80px;
        height: 80px;
      }

      .brand-info h1 {
        font-size: 1.5rem;
      }

      .user-stats {
        flex-direction: column;
        gap: 1rem;
      }

      .stat-item {
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
      }
    }
  `]
})
export class UserProfileSimpleComponent implements OnInit, AfterViewInit {
  @ViewChild(ProfileManagementComponent) profileManagementComponent!: ProfileManagementComponent;

  currentUser: User | null = null;
  myRecipes: any[] = [];
  favoriteRecipes: any[] = [];
  likedRecipes: any[] = [];

  loading = true;
  loadingFavorites = true;
  loadingLiked = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadMyRecipes();
    this.loadFavorites();
    this.loadLikedRecipes();

  }

  ngAfterViewInit() {
    // ViewChild is now available
    console.log('ProfileManagementComponent available:', this.profileManagementComponent);
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      console.log('Loaded user from localStorage:', this.currentUser);
    }

    // Verify user is still authenticated
    this.http.get('/api/users/profile', { withCredentials: true }).subscribe({
      next: (user: any) => {
        console.log('API response user:', user);
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Trigger change detection
        this.currentUser = { ...user };
        console.log('Current user set to:', this.currentUser);
        console.log('User role:', this.currentUser?.role);
        console.log('User ID:', this.currentUser?._id);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  loadMyRecipes() {
    this.http.get('/api/themes/my-recipes', { withCredentials: true }).subscribe({
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

  loadFavorites() {
    this.http.get('/api/favorites', { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.favoriteRecipes = data;
        this.loadingFavorites = false;
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.loadingFavorites = false;
      }
    });
  }

  loadLikedRecipes() {
    this.http.get('/api/themes/liked', { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.likedRecipes = data;
        this.loadingLiked = false;
      },
      error: (err) => {
        console.error('Error loading liked recipes:', err);
        this.loadingLiked = false;
      }
    });
  }



  onProfileUpdated(profileData: any) {
    this.userService.updateProfileAdvanced(profileData).subscribe({
      next: (user) => {
        console.log('Profile updated successfully:', user);
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Force refresh of the profile data and trigger change detection
        setTimeout(() => {
          this.loadCurrentUser();
        }, 100);
        alert('Профилът е обновен успешно!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Грешка при обновяване на профила. Моля опитайте отново.');
      }
    });
  }

  onPasswordChanged(passwordData: { currentPassword: string, newPassword: string }) {
    this.userService.changePassword(passwordData.currentPassword, passwordData.newPassword).subscribe({
      next: (response) => {
        console.log('Password changed successfully:', response);
        if (this.profileManagementComponent) {
          this.profileManagementComponent.onPasswordChangeComplete(true);
        }
        alert('Паролата е сменена успешно!');
      },
      error: (error) => {
        console.error('Error changing password:', error);
        if (this.profileManagementComponent) {
          this.profileManagementComponent.onPasswordChangeComplete(false);
        }
        if (error.status === 400 || error.status === 401) {
          alert('Грешка: Невалидна текуща парола. Моля проверете и опитайте отново.');
        } else {
          alert('Грешка при смяна на паролата. Моля опитайте отново.');
        }
      }
    });
  }

  onAvatarUploaded(file: any) {
    this.userService.uploadAvatar(file).subscribe({
      next: (response) => {
        console.log('Avatar uploaded successfully:', response);
        if (response.user) {
          this.currentUser = response.user;
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          // Force refresh of the profile data and trigger change detection
          setTimeout(() => {
            this.loadCurrentUser();
          }, 100);
        }
        alert('Аватарът е качен успешно!');
      },
      error: (error) => {
        console.error('Error uploading avatar:', error);
        alert('Грешка при качване на аватара. Моля опитайте отново.');
      }
    });
  }

  onRecipeDeleted(recipeId: any) {
    this.http.delete(`/api/themes/${recipeId}`, { withCredentials: true }).subscribe({
      next: () => {
        this.loadMyRecipes();
        alert('Рецептата е изтрита успешно!');
      },
      error: (err) => {
        console.error('Error deleting recipe:', err);
        alert('Грешка при изтриване на рецептата');
      }
    });
  }

  onRecipeRemovedFromFavorites(recipeId: any) {
    this.http.delete(`/api/favorites/${recipeId}`, { withCredentials: true }).subscribe({
      next: () => {
        this.favoriteRecipes = this.favoriteRecipes.filter(recipe => recipe._id !== recipeId);
        alert('Рецептата е премахната от любими!');
      },
      error: (err) => {
        console.error('Error removing from favorites:', err);
        alert('Грешка при премахване от любими');
      }
    });
  }

  deleteAccount() {
    if (confirm('Сигурни ли сте, че искате да изтриете вашия акаунт? Това действие не може да бъде отменено.')) {
      this.http.delete('/api/users/profile', { withCredentials: true }).subscribe({
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

  getRoleText(role: string | undefined): string {
    if (!role) return 'Неизвестна';
    const roleMap: { [key: string]: string } = {
      'admin': 'Администратор',
      'user': 'Потребител'
    };
    return roleMap[role] || 'Неизвестна';
  }

  formatDate(timestamp: string | undefined): string {
    if (!timestamp) return 'Неизвестна дата';
    const date = new Date(timestamp);
    return date.toLocaleDateString('bg-BG');
  }

  getAvatarUrl(): string {
    if (!this.currentUser?.avatar) {
      return 'assets/profile.png'; // Default avatar
    }

    // If avatar is a full URL, return it as is
    if (this.currentUser.avatar.startsWith('http')) {
      return this.currentUser.avatar;
    }

    // If avatar is a relative path, construct the full URL
    return `http://localhost:3000${this.currentUser.avatar}`;
  }

  logout() {
    this.http.post('/api/logout', {}, { withCredentials: true }).subscribe({
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
