import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private userService: UserService, private router: Router) { }

  get username():string{
    return this.userService.user?.username || 'приятелю'
  }
  get isLoggedIn(): boolean {
    return this.userService.isLogged;
  }
}
