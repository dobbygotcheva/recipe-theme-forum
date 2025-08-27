import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private userService: UserService, private router: Router) { }
  
  login(form: NgForm): void {
    console.log('=== LOGIN DEBUG ===');
    console.log('Login method called');
    console.log('Form valid:', form.valid);
    console.log('Form value:', form.value);
    console.log('Form controls:', form.controls);
    
    if (form.invalid) {
      console.log('Form is invalid, returning');
      console.log('Form errors:', form.errors);
      Object.keys(form.controls).forEach(key => {
        const control = form.controls[key];
        console.log(`${key} valid:`, control.valid, 'errors:', control.errors);
      });
      return;
    }
    
    const {email, password} = form.value;
    console.log('Attempting login with:', { email, password });
    
    this.userService.login(email, password).subscribe({
      next: (user) => {
        console.log('Login successful:', user);
        console.log('Navigating to /themes');
        this.router.navigate(['/themes']);
      },
      error: (error) => {
        console.error('Login error:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        alert('Login failed: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  testLogin(): void {
    console.log('=== TEST LOGIN DEBUG ===');
    console.log('Test login method called');
    
    // Test with hardcoded credentials
    const email = 'test@example.com';
    const password = 'password123';
    
    console.log('Testing login with:', { email, password });
    
    this.userService.login(email, password).subscribe({
      next: (user) => {
        console.log('Test login successful:', user);
        console.log('Navigating to /themes');
        this.router.navigate(['/themes']);
      },
      error: (error) => {
        console.error('Test login error:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        alert('Test login failed: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }
}
