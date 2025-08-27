import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  template: `
    <div class="admin-login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="admin-icon">🔐</div>
          <h1>Admin Login</h1>
          <p>Вход в административния панел</p>
        </div>
        
        <form (ngSubmit)="login()" class="login-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="credentials.email" 
              required
              class="form-control"
              placeholder="admin@example.com"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required
              class="form-control"
              placeholder="••••••••"
            />
          </div>
          
          <div *ngIf="error" class="error-message">
            ❌ {{ error }}
          </div>
          
          <div *ngIf="loading" class="loading-message">
            🔄 Logging in...
          </div>
          
          <button 
            type="submit" 
            [disabled]="loading" 
            class="login-btn"
          >
            {{ loading ? 'Logging in...' : 'Login as Admin' }}
          </button>
        </form>
        
        <div class="back-link">
          <a routerLink="/" class="back-btn">← Назад към началото</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 100%;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .admin-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .login-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .login-header p {
      color: #7f8c8d;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .form-control {
      padding: 1rem;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error-message {
      color: #e74c3c;
      background: #fdf2f2;
      padding: 1rem;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
    }

    .loading-message {
      color: #667eea;
      background: #f8f9ff;
      padding: 1rem;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
    }

    .login-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .back-link {
      text-align: center;
      margin-top: 2rem;
    }

    .back-btn {
      color: #7f8c8d;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .back-btn:hover {
      color: #667eea;
    }

    @media (max-width: 768px) {
      .admin-login-container {
        padding: 1rem;
      }
      
      .login-card {
        padding: 2rem;
      }
    }
  `]
})
export class AdminLoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) { }

  login() {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Моля въведете email и парола';
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post('/api/login', this.credentials).subscribe({
      next: (user: any) => {
        this.loading = false;
        if (user.role === 'admin') {
          console.log('Admin login successful:', user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          // Navigate to admin dashboard
          this.router.navigate(['/admin']);
        } else {
          this.error = 'Нямате администраторски права';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Грешка при влизане';
        console.error('Login error:', err);
      }
    });
  }
}
