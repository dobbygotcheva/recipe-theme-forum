import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-simple-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>🔐 Вход в системата</h2>
          <p>Влезте в своя акаунт</p>
        </div>

        <form (ngSubmit)="login()" class="login-form">
          <div class="form-group">
            <label for="email">📧 Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="email" 
              required 
              placeholder="Въведете вашия email"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="password">🔒 Парола:</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="password" 
              required 
              placeholder="Въведете вашата парола"
              class="form-input"
            >
          </div>

          <button type="submit" class="login-btn" [disabled]="loading">
            {{ loading ? 'Влизане...' : '🚪 Влез' }}
          </button>
        </form>

        <div class="login-footer">
          <p>Нямате акаунт? <a href="#" (click)="showRegister = true">Регистрирайте се</a></p>
        </div>

        <div *ngIf="error" class="error-message">
          ❌ {{ error }}
        </div>

        <div *ngIf="success" class="success-message">
          ✅ {{ success }}
        </div>
      </div>

      <!-- Simple Register Form -->
      <div *ngIf="showRegister" class="register-card">
        <div class="register-header">
          <h2>📝 Регистрация</h2>
          <p>Създайте нов акаунт</p>
        </div>

        <form (ngSubmit)="register()" class="register-form">
          <div class="form-group">
            <label for="reg-username">👤 Потребителско име:</label>
            <input 
              type="text" 
              id="reg-username" 
              name="username"
              [(ngModel)]="regUsername" 
              required 
              placeholder="Въведете потребителско име"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="reg-email">📧 Email:</label>
            <input 
              type="email" 
              id="reg-email" 
              name="regEmail"
              [(ngModel)]="regEmail" 
              required 
              placeholder="Въведете вашия email"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="reg-password">🔒 Парола:</label>
            <input 
              type="password" 
              id="reg-password" 
              name="regPassword"
              [(ngModel)]="regPassword" 
              required 
              placeholder="Въведете парола"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="reg-repeat-password">🔒 Повторете парола:</label>
            <input 
              type="password" 
              id="reg-repeat-password" 
              name="regRepeatPassword"
              [(ngModel)]="regRepeatPassword" 
              required 
              placeholder="Повторете парола"
              class="form-input"
            >
          </div>

          <button type="submit" class="register-btn" [disabled]="loading">
            {{ loading ? 'Регистрация...' : '📝 Регистрирай се' }}
          </button>
        </form>

        <div class="register-footer">
          <p>Вече имате акаунт? <a href="#" (click)="showRegister = false">Влезте</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .login-card, .register-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
      margin: 1rem;
    }

    .login-header, .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h2, .register-header h2 {
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
    }

    .login-header p, .register-header p {
      color: #7f8c8d;
      margin: 0;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .login-btn, .register-btn {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .login-btn:hover:not(:disabled), .register-btn:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .login-btn:disabled, .register-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .login-footer, .register-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
    }

    .login-footer a, .register-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .login-footer a:hover, .register-footer a:hover {
      text-decoration: underline;
    }

    .error-message {
      background: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
      padding: 1rem;
      border-radius: 10px;
      margin-top: 1rem;
      text-align: center;
    }

    .success-message {
      background: rgba(39, 174, 96, 0.1);
      color: #27ae60;
      padding: 1rem;
      border-radius: 10px;
      margin-top: 1rem;
      text-align: center;
    }
  `]
})
export class SimpleLoginComponent {
  email = '';
  password = '';
  regUsername = '';
  regEmail = '';
  regPassword = '';
  regRepeatPassword = '';
  loading = false;
  error = '';
  success = '';
  showRegister = false;

  constructor(private http: HttpClient, private router: Router) { }

  login() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.http.post('/api/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = 'Успешен вход!';

        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(response));

        // Redirect based on role
        if (response.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Грешка при вход. Проверете вашите данни.';
        console.error('Login error:', err);
      }
    });
  }

  register() {
    if (this.regPassword !== this.regRepeatPassword) {
      this.error = 'Паролите не съвпадат!';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.http.post('/api/register', {
      username: this.regUsername,
      email: this.regEmail,
      password: this.regPassword
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = response.message || 'Регистрацията е успешна! Моля, влезте с вашите данни.';

        // Redirect to login form after a short delay
        setTimeout(() => {
          this.showRegister = false;
          this.success = '';
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Грешка при регистрация. Проверете вашите данни.';
        console.error('Register error:', err);
      }
    });
  }


}
