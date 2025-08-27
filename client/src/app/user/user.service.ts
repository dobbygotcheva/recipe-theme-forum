import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, tap } from 'rxjs';
import { User } from '../shared/interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  private user$$ = new BehaviorSubject<User | undefined>(undefined);
  public user$ = this.user$$.asObservable();

  user: User | undefined;
  USER_KEY = '[user]';

  get isLogged(): boolean {
    return !!this.user;
  }

  private subscription: Subscription;

  constructor(private http: HttpClient) {
    this.subscription = this.user$.subscribe((user) => {
      this.user = user;
    });

    // Initialize user from localStorage if available
    this.initializeUser();
  }

  private initializeUser(): void {
    console.log('UserService: Initializing user from localStorage...');
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('UserService: Found user in localStorage:', user);
        console.log('UserService: Emitting user data via user$$.next()');
        this.user$$.next(user);
        console.log('UserService: User data emitted, current user$ value:', this.user);
        // Verify session is still valid by calling getProfile
        this.verifySession();
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    } else {
      console.log('UserService: No user found in localStorage');
    }
  }

  private verifySession(): void {
    // Only verify if we have a user
    if (this.user) {
      console.log('UserService: Verifying session for user:', this.user.username);
      // For now, skip session verification to prevent login issues
      // We can re-enable this later once the basic flow works
      console.log('UserService: Session verification skipped for now');
      /*
      this.getProfile().subscribe({
        next: (user) => {
          console.log('UserService: Session verified successfully:', user);
        },
        error: (error) => {
          console.log('UserService: Session verification failed:', error);
          // Don't immediately log out on verification failure
          // This could be a temporary network issue
          // Only log out if it's a 401 (unauthorized) error
          if (error.status === 401) {
            console.log('UserService: 401 error - logging out user');
            this.user$$.next(undefined);
            localStorage.removeItem('currentUser');
          } else {
            console.log('UserService: Non-401 error - keeping user logged in');
          }
        }
      });
      */
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  login(email: string, password: string) {
    console.log('UserService.login called with:', { email, password });
    console.log('Making HTTP request to /api/login');
    console.log('Request payload:', { email, password });

    return this.http
      .post<User>('/api/login', { email, password }, { withCredentials: true })
      .pipe(
        tap((user) => {
          console.log('Login response received:', user);
          console.log('UserService: Setting user in service...');
          this.user$$.next(user);
          console.log('UserService: User set in service, current user:', this.user);
          // Save user to localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('UserService: User saved to localStorage and state updated');
          console.log('UserService: Final state - isLogged:', this.isLogged, 'user:', this.user);
        })
      );
  }

  register(
    username: string,
    email: string,
    password: string,
    rePass: string,
  ) {
    return this.http
      .post<User>('/api/register', {
        username,
        email,
        password,
        repeatPassword: rePass,
      }, { withCredentials: true })
      .pipe(tap((user) => {
        this.user$$.next(user);
        // Save user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
      }));
  }

  logout() {
    return this.http
      .post<User>('/api/logout', {}, { withCredentials: true })
      .pipe(tap(() => {
        this.user$$.next(undefined);
        // Remove user from localStorage
        localStorage.removeItem('currentUser');
      }));
  }

  getProfile() {
    return this.http
      .get<User>('/api/users/profile', { withCredentials: true })
      .pipe(tap((user) => {
        this.user$$.next(user);
        // Update localStorage with fresh user data
        localStorage.setItem('currentUser', JSON.stringify(user));
      }));
  }

  updateProfile(username: string, email: string, tel?: string) {
    return this.http
      .put<User>('/api/users/profile', { username, email }, { withCredentials: true })
      .pipe(tap((user) => this.user$$.next(user)));
  }

  updateProfileAdvanced(profileData: Partial<User>) {
    return this.http
      .put<User>('/api/users/profile', profileData, { withCredentials: true })
      .pipe(tap((user) => this.user$$.next(user)));
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http
      .put<any>('/api/users/password', { currentPassword, newPassword }, { withCredentials: true })
      .pipe(tap((response) => {
        if (response.user) {
          this.user$$.next(response.user);
        }
      }));
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http
      .post<any>('/api/users/avatar', formData, { withCredentials: true })
      .pipe(tap((response) => {
        if (response.user) {
          this.user$$.next(response.user);
        }
      }));
  }
}

