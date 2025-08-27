import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';
import { UserService } from '../../../user/user.service';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss']
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  isLoading = false;
  private subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationService,
    public userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.userService.isLogged) {
      this.loadNotifications();
      this.loadUnreadCount();
    }

    // Subscribe to unread count changes
    this.subscriptions.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications(10, 0).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    if (!notification.read) {
      this.notificationService.markAsRead(notification._id).subscribe({
        next: () => {
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }

    // Navigate based on notification type
    this.navigateToNotification(notification);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => notification.read = true);
        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  deleteNotification(notificationId: string, event: Event): void {
    event.stopPropagation();
    
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
    
    this.isOpen = false;
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

  viewFullReply(notification: Notification, event: Event): void {
    event.stopPropagation();
    
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
