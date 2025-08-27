const NotificationService = require('../utils/notificationService');

// Get user notifications
function getUserNotifications(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { limit = 20, offset = 0 } = req.query;
        const notifications = NotificationService.getUserNotifications(
            req.user._id, 
            parseInt(limit), 
            parseInt(offset)
        );

        res.json(notifications);
    } catch (error) {
        next(error);
    }
}

// Get unread notification count
function getUnreadCount(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const count = NotificationService.getUnreadCount(req.user._id);
        res.json({ count });
    } catch (error) {
        next(error);
    }
}

// Mark notification as read
function markAsRead(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { notificationId } = req.params;
        const notification = NotificationService.markAsRead(notificationId, req.user._id);

        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }

        res.json(notification);
    } catch (error) {
        next(error);
    }
}

// Mark all notifications as read
function markAllAsRead(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const count = NotificationService.markAllAsRead(req.user._id);
        res.json({ message: `${count} notifications marked as read` });
    } catch (error) {
        next(error);
    }
}

// Delete notification
function deleteNotification(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { notificationId } = req.params;
        const deleted = NotificationService.deleteNotification(notificationId, req.user._id);

        if (!deleted) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }

        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
