import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { UserService } from '../../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  canActivate() {
    console.log('🔒 AdminGuard - canActivate() called');

    return this.userService.user$.pipe(
      take(1),
      map(user => {
        console.log('🔒 AdminGuard - User from service:', user);

        if (user && user.role === 'admin') {
          console.log('✅ AdminGuard - Access granted for admin user');
          return true;
        } else {
          console.log('❌ AdminGuard - Access denied, redirecting to admin login');
          this.router.navigate(['/admin/login']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('❌ AdminGuard - Error occurred:', error);
        console.log('🔒 AdminGuard - Redirecting to admin login due to error');
        this.router.navigate(['/admin/login']);
        return of(false);
      })
    );
  }
}
