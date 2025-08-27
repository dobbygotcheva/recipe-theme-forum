import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { News } from '../shared/interfaces/news';
import { NewsService } from '../shared/services/news.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  news: News[] = [];
  isLoading = true;
  selectedNews: News | null = null;
  showCreateForm = false;
  newsForm: FormGroup;

  constructor(
    private newsService: NewsService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      summary: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      tags: [''],
      featured: [false]
    });
  }

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading = true;
    this.newsService.getPublishedNews().subscribe({
      next: (news) => {
        this.news = news;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.isLoading = false;
      }
    });
  }

  viewNews(news: News): void {
    this.selectedNews = news;
  }

  closeNews(): void {
    this.selectedNews = null;
  }

  getTruncatedContent(content: string, maxLength: number = 150): string {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  get isAdmin(): boolean {
    return this.userService.user?.role === 'admin';
  }

  showCreateNewsForm(): void {
    this.showCreateForm = true;
  }

  hideCreateNewsForm(): void {
    this.showCreateForm = false;
    this.newsForm.reset();
  }

  createNews(): void {
    if (this.newsForm.valid) {
      const formData = this.newsForm.value;
      const newsData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      this.newsService.createNews(newsData).subscribe({
        next: (newNews) => {
          console.log('✅ News created successfully:', newNews);
          this.news.unshift(newNews); // Add to beginning of array
          this.hideCreateNewsForm();
          this.loadNews(); // Reload to get updated data
          alert('Новината е публикувана успешно!');
        },
        error: (error) => {
          console.error('❌ Error creating news:', error);
          alert('Грешка при създаване на новината');
        }
      });
    }
  }
}
