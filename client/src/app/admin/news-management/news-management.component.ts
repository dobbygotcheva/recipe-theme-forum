import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService } from '../../shared/services/news.service';
import { News } from '../../shared/interfaces/news';

@Component({
  selector: 'app-news-management',
  templateUrl: './news-management.component.html',
  styleUrls: ['./news-management.component.scss']
})
export class NewsManagementComponent implements OnInit {
  news: News[] = [];
  isLoading = true;
  showCreateForm = false;
  editingNews: News | null = null;
  selectedStatus = 'all';
  searchTerm = '';

  newsForm: FormGroup;

  constructor(
    private newsService: NewsService,
    private fb: FormBuilder
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      summary: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      tags: [''],
      featured: [false],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading = true;
    this.newsService.getAllNews().subscribe({
      next: (data) => {
        this.news = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.isLoading = false;
      }
    });
  }

  createNews(): void {
    if (this.newsForm.valid) {
      const formData = this.newsForm.value;
      const newsData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
        status: 'draft'
      };

      this.newsService.createNews(newsData).subscribe({
        next: () => {
          this.loadNews();
          this.resetForm();
          this.showCreateForm = false;
        },
        error: (error) => {
          console.error('Error creating news:', error);
        }
      });
    }
  }

  editNews(news: News): void {
    this.editingNews = news;
    this.newsForm.patchValue({
      title: news.title,
      summary: news.summary,
      content: news.content,
      tags: news.tags?.join(', ') || '',
      featured: news.featured || false,
      image: news.image || ''
    });
    this.showCreateForm = true;
  }

  updateNews(): void {
    if (this.newsForm.valid && this.editingNews) {
      const formData = this.newsForm.value;
      const newsData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      this.newsService.updateNews(this.editingNews._id, newsData).subscribe({
        next: () => {
          this.loadNews();
          this.resetForm();
          this.showCreateForm = false;
          this.editingNews = null;
        },
        error: (error) => {
          console.error('Error updating news:', error);
        }
      });
    }
  }

  deleteNews(newsId: string): void {
    if (confirm('Are you sure you want to delete this news article?')) {
      this.newsService.deleteNews(newsId).subscribe({
        next: () => {
          this.loadNews();
        },
        error: (error) => {
          console.error('Error deleting news:', error);
        }
      });
    }
  }

  publishNews(newsId: string): void {
    this.newsService.publishNews(newsId).subscribe({
      next: () => {
        this.loadNews();
      },
      error: (error) => {
        console.error('Error publishing news:', error);
      }
    });
  }

  archiveNews(newsId: string): void {
    this.newsService.archiveNews(newsId).subscribe({
      next: () => {
        this.loadNews();
      },
      error: (error) => {
        console.error('Error archiving news:', error);
      }
    });
  }

  resetForm(): void {
    this.newsForm.reset();
    this.editingNews = null;
  }

  cancelEdit(): void {
    this.resetForm();
    this.showCreateForm = false;
  }

  get filteredNews(): News[] {
    return this.news.filter(news => {
      const matchesSearch = news.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          news.summary?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || news.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'published': return 'badge-published';
      case 'draft': return 'badge-draft';
      case 'archived': return 'badge-archived';
      default: return 'badge-draft';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return 'Draft';
    }
  }

  getDraftCount(): number {
    return this.news.filter(n => n.status === 'draft').length;
  }

  getPublishedCount(): number {
    return this.news.filter(n => n.status === 'published').length;
  }

  getArchivedCount(): number {
    return this.news.filter(n => n.status === 'archived').length;
  }

  getTruncatedContent(content: string, maxLength: number = 200): string {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
}
