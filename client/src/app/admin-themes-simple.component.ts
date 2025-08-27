import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-themes-simple',
  template: `
    <div class="admin-themes">
      <header class="admin-header">
        <div class="header-content">
          <div class="admin-brand">
            <div class="admin-icon">📝</div>
            <div class="brand-info">
              <h1>Модерация на рецепти</h1>
              <p>Управлявайте и одобрявайте рецепти</p>
            </div>
          </div>
          
          <div class="admin-user">
            <span>Админ: {{ currentUser?.username }}</span>
            <button (click)="logout()" class="logout-btn">🚪 Изход</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <div class="content-header">
          <h2>📋 Всички рецепти</h2>
          <button (click)="goBack()" class="back-btn">← Назад</button>
        </div>

        <div *ngIf="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Зареждане на рецепти...</p>
        </div>

        <div *ngIf="!loading && themes.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>Няма рецепти</h3>
          <p>Все още не са създадени рецепти за модерация</p>
        </div>

        <div *ngIf="!loading && themes.length > 0" class="themes-grid">
          <div *ngFor="let theme of themes" class="theme-card" [class]="'status-' + theme.status">
            <div class="theme-header">
              <h3>{{ theme.title }}</h3>
              <span class="status-badge" [class]="'status-' + theme.status">
                {{ getStatusText(theme.status) }}
              </span>
            </div>
            
            <div class="theme-content">
              <p class="theme-description">{{ theme.description }}</p>
              <div class="theme-meta">
                <span class="author">👤 {{ theme.author }}</span>
                <span class="date">📅 {{ formatDate(theme.created_at) }}</span>
                <span class="category">🏷️ {{ theme.category }}</span>
              </div>
            </div>

            <div class="theme-actions">
              <button 
                *ngIf="theme.status === 'pending'" 
                (click)="approveTheme(theme._id)" 
                class="action-btn approve-btn"
                [disabled]="processing === theme._id"
              >
                {{ processing === theme._id ? 'Одобряване...' : '✅ Одобри' }}
              </button>
              
              <button 
                *ngIf="theme.status === 'pending'" 
                (click)="rejectTheme(theme._id)" 
                class="action-btn reject-btn"
                [disabled]="processing === theme._id"
              >
                {{ processing === theme._id ? 'Отхвърляне...' : '❌ Отхвърли' }}
              </button>
              
              <button 
                (click)="deleteTheme(theme._id)" 
                class="action-btn delete-btn"
                [disabled]="processing === theme._id"
              >
                {{ processing === theme._id ? 'Изтриване...' : '🗑️ Изтрий' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-themes {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .admin-header {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
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

    .admin-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .admin-icon {
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

    .admin-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logout-btn, .back-btn {
      background: rgba(231, 76, 60, 0.2);
      border: 1px solid #e74c3c;
      color: #e74c3c;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover, .back-btn:hover {
      background: rgba(231, 76, 60, 0.3);
      transform: translateY(-2px);
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .content-header h2 {
      color: #2c3e50;
      margin: 0;
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

    .themes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .theme-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-left: 4px solid #ddd;
    }

    .theme-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .theme-card.status-pending {
      border-left-color: #f39c12;
    }

    .theme-card.status-approved {
      border-left-color: #27ae60;
    }

    .theme-card.status-rejected {
      border-left-color: #e74c3c;
    }

    .theme-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .theme-header h3 {
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

    .theme-content {
      margin-bottom: 1.5rem;
    }

    .theme-description {
      color: #7f8c8d;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .theme-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #95a5a6;
    }

    .theme-actions {
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

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .approve-btn {
      background: rgba(39, 174, 96, 0.2);
      color: #27ae60;
    }

    .approve-btn:hover:not(:disabled) {
      background: rgba(39, 174, 96, 0.3);
      transform: translateY(-2px);
    }

    .reject-btn {
      background: rgba(243, 156, 18, 0.2);
      color: #f39c12;
    }

    .reject-btn:hover:not(:disabled) {
      background: rgba(243, 156, 18, 0.3);
      transform: translateY(-2px);
    }

    .delete-btn {
      background: rgba(231, 76, 60, 0.2);
      color: #e74c3c;
    }

    .delete-btn:hover:not(:disabled) {
      background: rgba(231, 76, 60, 0.3);
      transform: translateY(-2px);
    }
  `]
})
export class AdminThemesSimpleComponent implements OnInit {
  currentUser: any = null;
  themes: any[] = [];
  loading = true;
  processing: string | null = null;

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

    // Verify user is still authenticated and is admin
    this.http.get('/api/users/profile').subscribe({
      next: (user: any) => {
        if (user.role !== 'admin') {
          this.router.navigate(['/admin/login']);
        }
      },
      error: () => {
        this.router.navigate(['/admin/login']);
      }
    });
  }

  loadThemes() {
    this.http.get('/api/admin/themes').subscribe({
      next: (data: any) => {
        this.themes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading themes:', err);
        this.loading = false;
      }
    });
  }

  approveTheme(themeId: string) {
    this.processing = themeId;
    this.http.put(`/api/admin/themes/${themeId}/approve`, {}).subscribe({
      next: () => {
        this.loadThemes();
        this.processing = null;
      },
      error: (err) => {
        console.error('Error approving theme:', err);
        this.processing = null;
      }
    });
  }

  rejectTheme(themeId: string) {
    this.processing = themeId;
    this.http.put(`/api/admin/themes/${themeId}/reject`, {}).subscribe({
      next: () => {
        this.loadThemes();
        this.processing = null;
      },
      error: (err) => {
        console.error('Error rejecting theme:', err);
        this.processing = null;
      }
    });
  }

  deleteTheme(themeId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете тази рецепта?')) {
      this.processing = themeId;
      this.http.delete(`/api/admin/themes/${themeId}`).subscribe({
        next: () => {
          this.loadThemes();
          this.processing = null;
        },
        error: (err) => {
          console.error('Error deleting theme:', err);
          this.processing = null;
        }
      });
    }
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
    const date = new Date(timestamp);
    return date.toLocaleDateString('bg-BG');
  }

  goBack() {
    this.router.navigate(['/admin/profile']);
  }

  logout() {
    this.http.post('/api/logout', {}).subscribe({
      next: () => {
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      },
      error: () => {
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      }
    });
  }
}
