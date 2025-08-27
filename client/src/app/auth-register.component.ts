import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user/user.service';

@Component({
  selector: 'app-auth-register',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">👤</div>
          <h1>Регистрация</h1>
          <p>Създайте нов акаунт</p>
        </div>
        
        <form (ngSubmit)="register()" class="auth-form">
          <div class="form-group">
            <label for="username">Потребителско име:</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              [(ngModel)]="credentials.username" 
              required
              class="form-control"
              placeholder="Въведете потребителско име"
            />
          </div>
          
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
          
          <div class="form-group">
            <label for="repeatPassword">Повтори парола:</label>
            <input 
              type="password" 
              id="repeatPassword" 
              name="repeatPassword"
              [(ngModel)]="credentials.repeatPassword"
              required
              class="form-control"
              placeholder="Повторете паролата"
            />
          </div>
          
          <div *ngIf="error" class="error-message">
            ❌ {{ error }}
          </div>
          
          <div *ngIf="success" class="success-message">
            ✅ {{ success }}
          </div>
          
          <div *ngIf="loading" class="loading-message">
            🔄 Създаване на акаунт...
          </div>
          
          <button 
            type="submit" 
            [disabled]="loading" 
            class="auth-btn"
          >
            {{ loading ? 'Създаване...' : 'Регистрация' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Вече имате акаунт? <a routerLink="/auth/login" class="auth-link">Влезте тук</a></p>
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

    .success-message {
      color: #27ae60;
      background: #f0f9f0;
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
export class AuthRegisterComponent {
  credentials = {
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
  };

  loading = false;
  error = '';
  success = '';

  constructor(private userService: UserService, private router: Router) { }

  register() {
    if (!this.credentials.username || !this.credentials.email || !this.credentials.password) {
      this.error = 'Моля попълнете всички полета';
      return;
    }

    if (this.credentials.password !== this.credentials.repeatPassword) {
      this.error = 'Паролите не съвпадат';
      return;
    }

    if (this.credentials.password.length < 6) {
      this.error = 'Паролата трябва да е поне 6 символа';
      return;
    }

    this.loading = true;
    this.error = '';

    const registerData = {
      username: this.credentials.username,
      email: this.credentials.email,
      password: this.credentials.password,
      repeatPassword: this.credentials.repeatPassword
    };

    this.userService.register(registerData.username, registerData.email, registerData.password, registerData.repeatPassword).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log('Registration successful:', response);

        // Show success message and redirect to login
        this.success = response.message || 'Регистрацията е успешна! Моля, влезте с вашите данни.';

        // Redirect to login page after a short delay
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Грешка при регистрация';
        console.error('Registration error:', err);
      }
    });
  }


}
