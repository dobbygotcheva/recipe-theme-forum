import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private _lastLoggedInState: boolean | undefined;
  private userSubscription!: Subscription;
  public currentUser: any = null;
  public isLoggedIn: boolean = false;

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    console.log('Header: ngOnInit - UserService isLogged:', this.userService.isLogged);
    console.log('Header: ngOnInit - UserService user:', this.userService.user);

    // Subscribe to user changes
    this.userSubscription = this.userService.user$.subscribe(user => {
      console.log('Header: Received user from subscription:', user);
      this.currentUser = user;
      this.isLoggedIn = !!user;

      // Only log when the state changes to help debug issues
      if (this._lastLoggedInState !== this.isLoggedIn) {
        console.log('Header - isLoggedIn state changed:', this._lastLoggedInState, '->', this.isLoggedIn, 'User:', user);
        this._lastLoggedInState = this.isLoggedIn;
      }
    });

    // Also check the user service state immediately
    this.isLoggedIn = this.userService.isLogged;
    this.currentUser = this.userService.user;

    console.log('Header: After immediate check - isLoggedIn:', this.isLoggedIn, 'currentUser:', this.currentUser);
    console.log('Header: shouldShowFavorites:', this.shouldShowFavorites);
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get username(): string {
    return this.currentUser?.username || "";
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get shouldShowFavorites(): boolean {
    return this.isLoggedIn || this.userService.isLogged || !!this.currentUser;
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login'])
      },
      error: () => {
        this.router.navigate(['/auth/login'])
      }
    })

  }
}
