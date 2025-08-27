import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { News } from '../interfaces/news';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(private http: HttpClient) { }

  // Get all news (for admin)
  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>('/api/admin/news', { withCredentials: true });
  }

  // Get published news (for public)
  getPublishedNews(): Observable<News[]> {
    return this.http.get<News[]>('/api/news');
  }

  // Get single news article
  getNewsById(id: string): Observable<News> {
    return this.http.get<News>(`/api/news/${id}`);
  }

  // Create news article
  createNews(newsData: Partial<News>): Observable<News> {
    return this.http.post<News>('/api/admin/news', newsData, { withCredentials: true });
  }

  // Update news article
  updateNews(id: string, newsData: Partial<News>): Observable<News> {
    return this.http.put<News>(`/api/admin/news/${id}`, newsData, { withCredentials: true });
  }

  // Delete news article
  deleteNews(id: string): Observable<any> {
    return this.http.delete(`/api/admin/news/${id}`, { withCredentials: true });
  }

  // Publish news article
  publishNews(id: string): Observable<News> {
    return this.http.put<News>(`/api/admin/news/${id}/publish`, {}, { withCredentials: true });
  }

  // Archive news article
  archiveNews(id: string): Observable<News> {
    return this.http.put<News>(`/api/admin/news/${id}/archive`, {}, { withCredentials: true });
  }

  // Upload news image
  uploadNewsImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post('/api/admin/news/upload-image', formData, { withCredentials: true });
  }
}
