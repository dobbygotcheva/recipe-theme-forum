import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../shared/services/notification.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  isLoading = true;
  hasMore = true;
  currentPage = 0;
  pageSize = 20;
  private subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.userService.isLogged) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifications(reset: boolean = false): void {
    if (reset) {
      this.currentPage = 0;
      this.notifications = [];
    }

    this.isLoading = true;
    const offset = this.currentPage * this.pageSize;

    this.notificationService.getNotifications(this.pageSize, offset).subscribe({
      next: (newNotifications) => {
        if (reset) {
          this.notifications = newNotifications;
        } else {
          this.notifications = [...this.notifications, ...newNotifications];
        }
        
        this.hasMore = newNotifications.length === this.pageSize;
        this.currentPage++;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    if (!this.isLoading && this.hasMore) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification._id).subscribe({
        next: () => {
          notification.read = true;
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }

    this.navigateToNotification(notification);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => notification.read = true);
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  deleteNotification(notificationId: string): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n._id !== notificationId);
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  private navigateToNotification(notification: Notification): void {
    switch (notification.type) {
      case 'comment':
      case 'new_post':
      case 'rating':
        if (notification.data.themeId) {
          this.router.navigate(['/themes', notification.data.themeId]);
        }
        break;
      case 'news':
        this.router.navigate(['/news']);
        break;
      case 'follow':
        // Navigate to user profile if needed
        break;
    }
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  viewFullReply(notification: Notification): void {
    // For contact_reply notifications, show the full admin reply
    if (notification.type === 'contact_reply' && notification.data.adminReply) {
      // You can implement a modal or navigate to a detailed view
      // For now, let's show an alert with the full reply
      const fullReply = `
Отговор от Готвача за: "${notification.data.contactSubject}"

${notification.data.adminReply}

Дата: ${this.getTimeAgo(notification.created_at)}
      `;
      
      alert(fullReply);
    }
  }
}
