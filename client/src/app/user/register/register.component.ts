import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { matchPassValidator } from 'src/app/shared/validators/match-passwords-validator';
import { UserService } from '../user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.minLength(10)]],

    passGroup: this.fb.group({
      password: ['', [Validators.required, Validators.minLength(5)]],
      rePass: ['', [Validators.required]]
    },
      {
        validators: [matchPassValidator('password', 'rePass')]
      })
  })
  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) { }

  register(): void {
    if (this.form.invalid) {
      return;
    }
    const { username, email, passGroup: { password, rePass } = {} } = this.form.value;
    this.userService
      .register(username!, email!, password!, rePass!)
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          // Redirect to login page after successful registration
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration error:', err);
          // Handle error appropriately
        }
      })
  }
}
