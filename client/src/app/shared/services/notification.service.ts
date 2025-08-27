import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Notification {
  _id: string;
  userId: string;
  type: 'comment' | 'new_post' | 'news' | 'rating' | 'follow' | 'contact_reply';
  data: {
    themeId?: string;
    themeTitle?: string;
    commentAuthorId?: string;
    commentAuthorName?: string;
    commentText?: string;
    authorId?: string;
    authorName?: string;
    newsId?: string;
    newsTitle?: string;
    raterId?: string;
    raterName?: string;
    rating?: number;
    followerId?: string;
    followerName?: string;
    contactMessageId?: string;
    contactSubject?: string;
    adminReply?: string;
    message: string;
  };
  read: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Get user notifications
  getNotifications(limit: number = 20, offset: number = 0): Observable<Notification[]> {
    return this.http.get<Notification[]>(`/api/notifications?limit=${limit}&offset=${offset}`);
  }

  // Get unread notification count
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>('/api/notifications/unread-count')
      .pipe(
        tap(response => this.unreadCountSubject.next(response.count))
      );
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<Notification> {
    return this.http.put<Notification>(`/api/notifications/${notificationId}/read`, {})
      .pipe(
        tap(() => this.updateUnreadCount())
      );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>('/api/notifications/mark-all-read', {})
      .pipe(
        tap(() => this.unreadCountSubject.next(0))
      );
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/notifications/${notificationId}`)
      .pipe(
        tap(() => this.updateUnreadCount())
      );
  }

  // Update unread count
  private updateUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  // Get notification icon based on type
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'comment':
        return 'chat';
      case 'new_post':
        return 'restaurant_menu';
      case 'news':
        return 'article';
      case 'rating':
        return 'star';
      case 'follow':
        return 'person_add';
      case 'contact_reply':
        return 'chat';
      default:
        return 'notifications';
    }
  }

  // Get notification color based on type
  getNotificationColor(type: string): string {
    switch (type) {
      case 'comment':
        return '#2196F3';
      case 'new_post':
        return '#4CAF50';
      case 'news':
        return '#FF9800';
      case 'rating':
        return '#FFC107';
      case 'follow':
        return '#9C27B0';
      case 'contact_reply':
        return '#17a2b8';
      default:
        return '#757575';
    }
  }
}
