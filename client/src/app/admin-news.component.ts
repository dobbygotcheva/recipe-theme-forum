import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-news',
  template: `
    <div class="admin-news">
      <!-- Admin Header -->
      <header class="admin-header">
        <div class="header-content">
          <button (click)="goBack()" class="back-btn">← Назад</button>
          <div class="page-title">
            <h1>📰 Управление на новини</h1>
            <p>Създавайте, редактирайте и публикувайте новини</p>
          </div>
          <button (click)="showCreateForm = true" class="create-btn">+ Нова новина</button>
        </div>
      </header>

      <main class="news-content">
        <!-- Create/Edit Form -->
        <div *ngIf="showCreateForm || editingNews" class="news-form-section">
          <div class="form-card">
            <h2>{{ editingNews ? 'Редактиране на новина' : 'Създаване на нова новина' }}</h2>
            
            <form (ngSubmit)="saveNews()" class="news-form">
              <div class="form-group">
                <label for="title">Заглавие:</label>
                <input 
                  type="text" 
                  id="title" 
                  [(ngModel)]="currentNews.title" 
                  required
                  class="form-control"
                  placeholder="Въведете заглавие на новината"
                />
              </div>
              
              <div class="form-group">
                <label for="summary">Кратко описание:</label>
                <textarea 
                  id="summary" 
                  [(ngModel)]="currentNews.summary" 
                  required
                  rows="3"
                  class="form-control"
                  placeholder="Кратко описание на новината"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label for="content">Съдържание:</label>
                <textarea 
                  id="content" 
                  [(ngModel)]="currentNews.content" 
                  required
                  rows="8"
                  class="form-control"
                  placeholder="Пълното съдържание на новината"
                ></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="tags">Тагове (разделени със запетая):</label>
                  <input 
                    type="text" 
                    id="tags" 
                    [(ngModel)]="tagsString" 
                    class="form-control"
                    placeholder="тагове, разделени, със запетая"
                  />
                </div>
                
                <div class="form-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="currentNews.featured"
                    />
                    Важна новина
                  </label>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" (click)="cancelEdit()" class="cancel-btn">Отказ</button>
                <button type="submit" class="save-btn">
                  {{ editingNews ? 'Запази промените' : 'Създай новина' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- News List -->
        <div class="news-list-section">
          <div class="section-header">
            <h2>Всички новини</h2>
            <div class="filters">
              <select [(ngModel)]="statusFilter" (change)="filterNews()" class="filter-select">
                <option value="">Всички статуси</option>
                <option value="draft">Чернови</option>
                <option value="published">Публикувани</option>
                <option value="archived">Архивирани</option>
              </select>
            </div>
          </div>
          
          <div *ngIf="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>Зареждане на новини...</p>
          </div>
          
          <div *ngIf="!loading && filteredNews.length === 0" class="empty-state">
            <div class="empty-icon">📰</div>
            <h3>Няма новини</h3>
            <p>Създайте първата си новина</p>
          </div>
          
          <div class="news-grid" *ngIf="!loading && filteredNews.length > 0">
            <div *ngFor="let article of filteredNews" class="news-card">
              <div class="news-header">
                <div class="news-status" [class]="'status-' + article.status">
                  {{ getStatusText(article.status) }}
                </div>
                <div class="news-featured" *ngIf="article.featured">⭐ Важна</div>
              </div>
              
              <h3 class="news-title">{{ article.title }}</h3>
              <p class="news-summary">{{ article.summary }}</p>
              
              <div class="news-meta">
                <span class="news-author">{{ article.author?.username || 'Admin' }}</span>
                <span class="news-date">{{ formatDate(article.created_at) }}</span>
                <span class="news-views">{{ article.views || 0 }} прегледа</span>
              </div>
              
              <div class="news-actions">
                <button (click)="editNews(article)" class="edit-btn">✏️ Редактирай</button>
                
                <button 
                  *ngIf="article.status === 'draft'" 
                  (click)="publishNews(article._id)" 
                  class="publish-btn"
                >
                  📢 Публикувай
                </button>
                
                <button 
                  *ngIf="article.status === 'published'" 
                  (click)="archiveNews(article._id)" 
                  class="archive-btn"
                >
                  📦 Архивирай
                </button>
                
                <button (click)="deleteNews(article._id)" class="delete-btn">🗑️ Изтрий</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-news {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .admin-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-btn, .create-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .back-btn:hover, .create-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .page-title h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .page-title p {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .news-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .news-form-section {
      margin-bottom: 3rem;
    }

    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .form-card h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .news-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1.5rem;
      align-items: end;
    }

    .form-group label {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .form-control {
      padding: 1rem;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.3s ease;
      resize: vertical;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .cancel-btn, .save-btn {
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .cancel-btn {
      background: #95a5a6;
      color: white;
    }

    .cancel-btn:hover {
      background: #7f8c8d;
    }

    .save-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .save-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      color: #2c3e50;
      margin: 0;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 2px solid #e9ecef;
      border-radius: 20px;
      background: white;
      cursor: pointer;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .news-card {
      background: white;
      padding: 1.5rem;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .news-card:hover {
      transform: translateY(-2px);
    }

    .news-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .news-status {
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-draft {
      background: #ffeaa7;
      color: #d63031;
    }

    .status-published {
      background: #a8e6cf;
      color: #00b894;
    }

    .status-archived {
      background: #ddd;
      color: #636e72;
    }

    .news-featured {
      color: #f39c12;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .news-title {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .news-summary {
      color: #7f8c8d;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .news-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #95a5a6;
    }

    .news-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .edit-btn, .publish-btn, .archive-btn, .delete-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 15px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .edit-btn {
      background: #74b9ff;
      color: white;
    }

    .publish-btn {
      background: #00b894;
      color: white;
    }

    .archive-btn {
      background: #fdcb6e;
      color: white;
    }

    .delete-btn {
      background: #e17055;
      color: white;
    }

    .edit-btn:hover, .publish-btn:hover, .archive-btn:hover, .delete-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }

    @media (max-width: 768px) {
      .admin-header {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }
      
      .news-content {
        padding: 1rem;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .news-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminNewsComponent implements OnInit {
  newsList: any[] = [];
  filteredNews: any[] = [];
  statusFilter = '';
  loading = true;

  showCreateForm = false;
  editingNews: any = null;
  currentNews: any = {
    title: '',
    summary: '',
    content: '',
    tags: [],
    featured: false,
    status: 'draft'
  };
  tagsString = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.http.get('/api/admin/news').subscribe({
      next: (data: any) => {
        this.newsList = data;
        this.filterNews();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading news:', err);
        this.loading = false;
      }
    });
  }

  filterNews() {
    if (this.statusFilter) {
      this.filteredNews = this.newsList.filter(news => news.status === this.statusFilter);
    } else {
      this.filteredNews = [...this.newsList];
    }
  }

  editNews(article: any) {
    this.editingNews = article;
    this.currentNews = { ...article };
    this.tagsString = article.tags ? article.tags.join(', ') : '';
    this.showCreateForm = false;
  }

  saveNews() {
    // Parse tags
    this.currentNews.tags = this.tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (this.editingNews) {
      // Update existing news
      this.http.put(`/api/admin/news/${this.editingNews._id}`, this.currentNews).subscribe({
        next: () => {
          this.loadNews();
          this.cancelEdit();
        },
        error: (err) => console.error('Error updating news:', err)
      });
    } else {
      // Create new news
      this.http.post('/api/admin/news', this.currentNews).subscribe({
        next: () => {
          this.loadNews();
          this.cancelEdit();
        },
        error: (err) => console.error('Error creating news:', err)
      });
    }
  }

  publishNews(newsId: string) {
    this.http.put(`/api/admin/news/${newsId}/publish`, {}).subscribe({
      next: () => this.loadNews(),
      error: (err) => console.error('Error publishing news:', err)
    });
  }

  archiveNews(newsId: string) {
    this.http.put(`/api/admin/news/${newsId}/archive`, {}).subscribe({
      next: () => this.loadNews(),
      error: (err) => console.error('Error archiving news:', err)
    });
  }

  deleteNews(newsId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете тази новина?')) {
      this.http.delete(`/api/admin/news/${newsId}`).subscribe({
        next: () => this.loadNews(),
        error: (err) => console.error('Error deleting news:', err)
      });
    }
  }

  cancelEdit() {
    this.showCreateForm = false;
    this.editingNews = null;
    this.currentNews = {
      title: '',
      summary: '',
      content: '',
      tags: [],
      featured: false,
      status: 'draft'
    };
    this.tagsString = '';
  }

  goBack() {
    this.router.navigate(['/admin/profile']);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Чернова',
      'published': 'Публикувана',
      'archived': 'Архивирана'
    };
    return statusMap[status] || status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bg-BG');
  }
}
