import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  isLoading = true;
  searchTerm = '';
  selectedRole = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.http.get('/api/admin/users').subscribe({
      next: (data: any) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  updateUserRole(userId: string, event: any): void {
    const newRole = (event.target as HTMLSelectElement).value;
    this.http.put(`/api/admin/users/${userId}/role`, { role: newRole }).subscribe({
      next: () => {
        this.loadUsers(); // Reload users after update
      },
      error: (error) => {
        console.error('Error updating user role:', error);
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`/api/admin/users/${userId}`).subscribe({
        next: () => {
          this.loadUsers(); // Reload users after deletion
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  get filteredUsers(): any[] {
    return this.users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      return matchesSearch && matchesRole;
    });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'badge-admin' : 'badge-user';
  }

  getAdminCount(): number {
    return this.users.filter(user => user.role === 'admin').length;
  }

  getRegularUserCount(): number {
    return this.users.filter(user => user.role !== 'admin').length;
  }
}
