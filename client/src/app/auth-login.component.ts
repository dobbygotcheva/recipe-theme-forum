import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user/user.service';

@Component({
  selector: 'app-auth-login',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">🔑</div>
          <h1>Вход</h1>
          <p>Влезте в акаунта си</p>
        </div>
        
        <form (ngSubmit)="login()" class="auth-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="credentials.email" 
              required
              class="form-control"
              placeholder="Въведете email адрес"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Парола:</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required
              class="form-control"
              placeholder="Въведете парола"
            />
          </div>
          
          <div *ngIf="error" class="error-message">
            ❌ {{ error }}
          </div>
          
          <div *ngIf="loading" class="loading-message">
            🔄 Влизане...
          </div>
          
          <button 
            type="submit" 
            [disabled]="loading" 
            class="auth-btn"
          >
            {{ loading ? 'Влизане...' : 'Вход' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Нямате акаунт? <a routerLink="/auth/register" class="auth-link">Регистрирайте се тук</a></p>
          <a routerLink="/" class="back-link">← Назад към началото</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      max-width: 450px;
      width: 100%;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .auth-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .auth-header p {
      color: #7f8c8d;
      margin: 0;
    }

    .auth-form {
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

    .auth-btn {
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

    .auth-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    .auth-footer p {
      margin-bottom: 1rem;
      color: #7f8c8d;
    }

    .auth-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .auth-link:hover {
      color: #5a67d8;
    }

    .back-link {
      color: #7f8c8d;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .back-link:hover {
      color: #667eea;
    }

    @media (max-width: 768px) {
      .auth-container {
        padding: 1rem;
      }
      
      .auth-card {
        padding: 2rem;
      }
    }
  `]
})
export class AuthLoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  loading = false;
  error = '';

  constructor(private userService: UserService, private router: Router) { }

  login() {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Моля въведете email и парола';
      return;
    }

    this.loading = true;
    this.error = '';

    this.userService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (user: any) => {
        this.loading = false;
        console.log('Login successful:', user);

        if (user.role === 'admin') {
          // Navigate to admin dashboard
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
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
