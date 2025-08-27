const { notifications, users, themes } = require('../../config/db-simple');

class NotificationService {
  // Create a new notification
  static createNotification(userId, type, data) {
    const { saveNotifications } = require('../../config/db-simple');

    const notificationId = Date.now().toString();
    const notification = {
      _id: notificationId,
      userId,
      type, // 'comment', 'new_post', 'news', 'rating', 'follow', 'contact_reply'
      data,
      read: false,
      created_at: new Date()
    };

    notifications.set(notificationId, notification);
    saveNotifications(); // Save to persistent storage
    return notification;
  }

  // Get notifications for a user
  static getUserNotifications(userId, limit = 20, offset = 0) {
    const userNotifications = Array.from(notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(offset, offset + limit);

    return userNotifications;
  }

  // Mark notification as read
  static markAsRead(notificationId, userId) {
    const notification = notifications.get(notificationId);
    if (notification && notification.userId === userId) {
      notification.read = true;
      notifications.set(notificationId, notification);
      return notification;
    }
    return null;
  }

  // Mark all notifications as read for a user
  static markAllAsRead(userId) {
    const userNotifications = Array.from(notifications.values())
      .filter(notification => notification.userId === userId && !notification.read);

    userNotifications.forEach(notification => {
      notification.read = true;
      notifications.set(notification._id, notification);
    });

    return userNotifications.length;
  }

  // Get unread notification count for a user
  static getUnreadCount(userId) {
    return Array.from(notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .length;
  }

  // Delete a notification
  static deleteNotification(notificationId, userId) {
    const notification = notifications.get(notificationId);
    if (notification && notification.userId === userId) {
      notifications.delete(notificationId);
      return true;
    }
    return false;
  }

  // Notification creation methods for different events
  static notifyNewComment(themeId, commentAuthorId, commentText) {
    const theme = themes.get(themeId);
    if (!theme) { return; }

    // Notify theme author (if different from comment author)
    if (theme.userId !== commentAuthorId) {
      const commentAuthor = users.get(commentAuthorId);
      this.createNotification(theme.userId, 'comment', {
        themeId,
        themeTitle: theme.title,
        commentAuthorId,
        commentAuthorName: commentAuthor?.username || 'Unknown User',
        commentText: commentText.substring(0, 100) + (commentText.length > 100 ? '...' : ''),
        message: `${commentAuthor?.username || 'Someone'} commented on your recipe "${theme.title}"`
      });
    }

    // Notify other commenters on the same theme
    const themeComments = theme.comments || [];
    const uniqueCommenters = [...new Set(themeComments.map(c => c.userId))];

    uniqueCommenters.forEach(commenterId => {
      if (commenterId !== commentAuthorId && commenterId !== theme.userId) {
        const commentAuthor = users.get(commentAuthorId);
        this.createNotification(commenterId, 'comment', {
          themeId,
          themeTitle: theme.title,
          commentAuthorId,
          commentAuthorName: commentAuthor?.username || 'Unknown User',
          commentText: commentText.substring(0, 100) + (commentText.length > 100 ? '...' : ''),
          message: `${commentAuthor?.username || 'Someone'} also commented on "${theme.title}"`
        });
      }
    });
  }

  static notifyNewPost(themeId, themeTitle, authorId) {
    const author = users.get(authorId);
    if (!author) { return; }

    // Notify all users who have commented on similar themes
    const allThemes = Array.from(themes.values());
    const similarThemeCommenters = new Set();

    allThemes.forEach(t => {
      if (t.comments && t.comments.length > 0) {
        t.comments.forEach(c => {
          if (c.userId !== authorId) {
            similarThemeCommenters.add(c.userId);
          }
        });
      }
    });

    // Send notifications to users who might be interested
    similarThemeCommenters.forEach(userId => {
      this.createNotification(userId, 'new_post', {
        themeId,
        themeTitle,
        authorId,
        authorName: author.username,
        message: `${author.username} posted a new recipe: "${themeTitle}"`
      });
    });
  }

  static notifyNewNews(newsId, newsTitle, authorId) {
    const author = users.get(authorId);
    if (!author) { return; }

    // Notify all users about important news
    const allUsers = Array.from(users.values());

    allUsers.forEach(user => {
      if (user._id !== authorId) {
        this.createNotification(user._id, 'news', {
          newsId,
          newsTitle,
          authorId,
          authorName: author.username,
          message: `New news: "${newsTitle}" by ${author.username}`
        });
      }
    });
  }

  static notifyNewRating(themeId, themeTitle, raterId, rating) {
    const theme = themes.get(themeId);
    const rater = users.get(raterId);
    if (!theme || !rater) { return; }

    // Notify theme author about new rating
    if (theme.userId !== raterId) {
      this.createNotification(theme.userId, 'rating', {
        themeId,
        themeTitle,
        raterId,
        raterName: rater.username,
        rating,
        message: `${rater.username} rated your recipe "${themeTitle}" with ${rating} stars`
      });
    }
  }

  static notifyFollow(followerId, followedId) {
    const follower = users.get(followerId);
    const followed = users.get(followedId);
    if (!follower || !followed) { return; }

    this.createNotification(followedId, 'follow', {
      followerId,
      followerName: follower.username,
      message: `${follower.username} started following you`
    });
  }
}

module.exports = NotificationService;
