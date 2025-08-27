import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-users',
    template: `
    <div class="admin-users">
      <!-- Admin Header -->
      <header class="admin-header">
        <div class="header-content">
          <div class="admin-brand">
            <div class="admin-icon">👥</div>
            <div class="brand-info">
              <h1>Управление на потребители</h1>
              <p>Управлявайте потребителски акаунти и роли</p>
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
          <h2>👥 Всички потребители</h2>
          <div class="filters">
            <select name="roleFilter" [(ngModel)]="roleFilter" (change)="filterUsers()" class="filter-select">
              <option value="">Всички роли</option>
              <option value="user">Потребители</option>
              <option value="admin">Администратори</option>
            </select>
          </div>
        </div>

        <div *ngIf="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Зареждане на потребители...</p>
        </div>

        <div *ngIf="!loading && users.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>Няма потребители</h3>
          <p>Все още не са регистрирани потребители</p>
        </div>

        <div *ngIf="!loading && users.length > 0" class="users-grid">
          <div *ngFor="let user of filteredUsers" class="user-card" [class]="'role-' + user.role">
            <div class="user-header">
              <h3>{{ user.username }}</h3>
              <span class="role-badge" [class]="'role-' + user.role">
                {{ getRoleText(user.role) }}
              </span>
            </div>
            
            <div class="user-content">
              <div class="user-info">
                <p class="user-email">📧 {{ user.email }}</p>
                <p class="user-date">📅 Регистриран: {{ formatDate(user.created_at) }}</p>
                <p class="user-stats">📝 Рецепти: {{ user.themes?.length || 0 }}</p>
              </div>
            </div>

            <div class="user-actions">
              <button 
                *ngIf="user.role === 'user'" 
                (click)="promoteToAdmin(user._id)" 
                class="action-btn promote-btn"
                [disabled]="processing === user._id"
              >
                {{ processing === user._id ? 'Промоция...' : '👑 Направи админ' }}
              </button>
              
              <button 
                *ngIf="user.role === 'admin' && user._id !== currentUser?._id" 
                (click)="demoteToUser(user._id)" 
                class="action-btn demote-btn"
                [disabled]="processing === user._id"
              >
                {{ processing === user._id ? 'Демоция...' : '👤 Премахни админ' }}
              </button>
              
              <button 
                *ngIf="user._id !== currentUser?._id" 
                (click)="deleteUser(user._id)" 
                class="action-btn delete-btn"
                [disabled]="processing === user._id"
              >
                {{ processing === user._id ? 'Изтриване...' : '🗑️ Изтрий' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
    styles: [`
    .admin-users {
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

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      font-size: 1rem;
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

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .user-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-left: 4px solid #ddd;
    }

    .user-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .user-card.role-admin {
      border-left-color: #f39c12;
    }

    .user-card.role-user {
      border-left-color: #3498db;
    }

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .user-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.3rem;
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

    .user-content {
      margin-bottom: 1.5rem;
    }

    .user-info p {
      margin: 0.5rem 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .user-actions {
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

    .promote-btn {
      background: rgba(243, 156, 18, 0.2);
      color: #f39c12;
    }

    .promote-btn:hover:not(:disabled) {
      background: rgba(243, 156, 18, 0.3);
      transform: translateY(-2px);
    }

    .demote-btn {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
    }

    .demote-btn:hover:not(:disabled) {
      background: rgba(52, 152, 219, 0.3);
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
export class AdminUsersComponent implements OnInit {
    currentUser: any = null;
    users: any[] = [];
    filteredUsers: any[] = [];
    loading = true;
    processing: string | null = null;
    roleFilter = '';

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit() {
        this.loadCurrentUser();
        this.loadUsers();
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

    loadUsers() {
        this.http.get('/api/admin/users').subscribe({
            next: (data: any) => {
                this.users = data;
                this.filteredUsers = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading users:', err);
                this.loading = false;
            }
        });
    }

    filterUsers() {
        if (!this.roleFilter) {
            this.filteredUsers = this.users;
        } else {
            this.filteredUsers = this.users.filter(user => user.role === this.roleFilter);
        }
    }

    promoteToAdmin(userId: string) {
        if (confirm('Сигурни ли сте, че искате да направите този потребител администратор?')) {
            this.processing = userId;
            this.http.put(`/api/admin/users/${userId}/role`, { role: 'admin' }).subscribe({
                next: () => {
                    this.loadUsers();
                    this.processing = null;
                },
                error: (err) => {
                    console.error('Error promoting user:', err);
                    this.processing = null;
                }
            });
        }
    }

    demoteToUser(userId: string) {
        if (confirm('Сигурни ли сте, че искате да премахнете администраторските права от този потребител?')) {
            this.processing = userId;
            this.http.put(`/api/admin/users/${userId}/role`, { role: 'user' }).subscribe({
                next: () => {
                    this.loadUsers();
                    this.processing = null;
                },
                error: (err) => {
                    console.error('Error demoting user:', err);
                    this.processing = null;
                }
            });
        }
    }

    deleteUser(userId: string) {
        if (confirm('Сигурни ли сте, че искате да изтриете този потребител? Това действие не може да бъде отменено.')) {
            this.processing = userId;
            this.http.delete(`/api/admin/users/${userId}`).subscribe({
                next: () => {
                    this.loadUsers();
                    this.processing = null;
                },
                error: (err) => {
                    console.error('Error deleting user:', err);
                    this.processing = null;
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

    formatDate(timestamp: string): string {
        const date = new Date(timestamp);
        return date.toLocaleDateString('bg-BG');
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
