import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit {
  isAuthenticating = true;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    // Skip authentication check for now to allow app to load
    this.isAuthenticating = false;

    // TODO: Re-enable authentication later
    // this.userService.getProfile().subscribe({
    //   next: () => {
    //     this.isAuthenticating = false;
    //   },
    //   error: () => {
    //     this.isAuthenticating = false;
    //   },
    //   complete: () => {
    //     this.isAuthenticating = false;
    //   },
    // });
  }
}
