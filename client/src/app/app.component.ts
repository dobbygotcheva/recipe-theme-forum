import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Theme Forum';
  currentUser: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  logout() {
    this.http.post('/api/logout', {}).subscribe({
      next: () => {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.router.navigate(['/']);
      },
      error: () => {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.router.navigate(['/']);
      }
    });
  }
}