import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-theme-moderation',
  templateUrl: './theme-moderation.component.html',
  styleUrls: ['./theme-moderation.component.scss']
})
export class ThemeModerationComponent implements OnInit {
  themes: any[] = [];
  isLoading = true;
  selectedStatus = 'all';
  searchTerm = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadThemes();
  }

  loadThemes(): void {
    this.isLoading = true;
    this.http.get('/api/admin/themes').subscribe({
      next: (data: any) => {
        this.themes = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading themes:', error);
        this.isLoading = false;
      }
    });
  }

  approveTheme(themeId: string): void {
    this.http.put(`/api/admin/themes/${themeId}/approve`, {}).subscribe({
      next: () => {
        this.loadThemes(); // Reload themes after approval
      },
      error: (error) => {
        console.error('Error approving theme:', error);
      }
    });
  }

  rejectTheme(themeId: string): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      this.http.put(`/api/admin/themes/${themeId}/reject`, { reason }).subscribe({
        next: () => {
          this.loadThemes(); // Reload themes after rejection
        },
        error: (error) => {
          console.error('Error rejecting theme:', error);
        }
      });
    }
  }

  deleteTheme(themeId: string): void {
    if (confirm('Are you sure you want to delete this theme? This action cannot be undone.')) {
      this.http.delete(`/api/admin/themes/${themeId}`).subscribe({
        next: () => {
          this.loadThemes(); // Reload themes after deletion
        },
        error: (error) => {
          console.error('Error deleting theme:', error);
        }
      });
    }
  }

  get filteredThemes(): any[] {
    return this.themes.filter(theme => {
      const matchesSearch = theme.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          theme.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || theme.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'approved': return 'badge-approved';
      case 'rejected': return 'badge-rejected';
      default: return 'badge-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending Review';
    }
  }

  getPendingCount(): number {
    return this.themes.filter(theme => theme.status === 'pending').length;
  }

  getApprovedCount(): number {
    return this.themes.filter(theme => theme.status === 'approved').length;
  }

  getRejectedCount(): number {
    return this.themes.filter(theme => theme.status === 'rejected').length;
  }
}
