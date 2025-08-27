const { users } = require('../config/db-simple');

// Simple in-memory storage for contact messages (in production, use a database)
let contactMessages = [
    {
        _id: '1',
        name: 'Иван Петров',
        email: 'ivan.petrov@example.com',
        subject: 'Въпрос за рецептата за баница',
        message: 'Здравейте! Искам да попитам как да направя баницата по-хрупкава. Имате ли съвети?',
        topic: 'cooking',
        userId: null,
        submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'new',
        readAt: null,
        repliedAt: null
    },
    {
        _id: '2',
        name: 'Мария Георгиева',
        email: 'maria.georgieva@example.com',
        subject: 'Информация за курсовете',
        message: 'Здравейте! Искам да се запиша за курса по готвене. Кога започва следващият?',
        topic: 'courses',
        userId: null,
        submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'read',
        readAt: new Date(Date.now() - 86400000).toISOString(),
        repliedAt: null
    },
    {
        _id: '3',
        name: 'Петър Димитров',
        email: 'petar.dimitrov@example.com',
        subject: 'Съвет за готвене на риба',
        message: 'Здравейте! Имате ли съвети как да готвя риба, за да не се разпада?',
        topic: 'tips',
        userId: null,
        submittedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: 'replied',
        readAt: new Date(Date.now() - 172800000).toISOString(),
        repliedAt: new Date(Date.now() - 86400000).toISOString(),
        adminReply: 'Здравейте! За да не се разпада рибата, я гответе на средна температура и не я обръщайте често. Използвайте тиган с тефлоново покритие и добавете малко брашна преди готвене.'
    }
];

// Submit a contact message
function submitContact(req, res, next) {
    console.log('🔍 submitContact called with body:', req.body);
    try {
        const { name, email, subject, message, topic, userId } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Моля, попълнете всички задължителни полета.'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                message: 'Моля, въведете валиден имейл адрес.'
            });
        }

        // Create contact message
        const contactMessage = {
            _id: Date.now().toString(),
            name,
            email,
            subject,
            message,
            topic: topic || 'general',
            userId: userId || null,
            submittedAt: new Date().toISOString(),
            status: 'new', // new, read, replied, archived
            readAt: null,
            repliedAt: null
        };

        contactMessages.push(contactMessage);

        console.log(`✅ New contact message received from ${name} (${email})`);
        console.log(`📝 Subject: ${subject}`);
        console.log(`🏷️ Topic: ${topic}`);

        res.status(201).json({
            message: 'Contact message submitted successfully',
            contactId: contactMessage._id
        });
    } catch (error) {
        console.error('❌ Error in submitContact:', error);
        next(error);
    }
}

// Get all contact messages (admin only)
function getAllContactMessages(req, res, next) {
    console.log('🔍 getAllContactMessages called');
    try {
        console.log('🔍 getAllContactMessages called by user:', req.user?.username);
        console.log('🔍 User role:', req.user?.role);
        console.log('🔍 Available contact messages:', contactMessages.length);

        // Sort by submission date (newest first)
        const sortedMessages = [...contactMessages].sort((a, b) =>
            new Date(b.submittedAt) - new Date(a.submittedAt)
        );

        console.log(`✅ Admin: Retrieved ${sortedMessages.length} contact messages`);
        res.json({ messages: sortedMessages });
    } catch (error) {
        console.error('❌ Error in getAllContactMessages:', error);
        next(error);
    }
}

// Get contact message by ID (admin only)
function getContactMessageById(req, res, next) {
    try {
        const { id } = req.params;
        const message = contactMessages.find(m => m._id === id);

        if (!message) {
            return res.status(404).json({ error: 'Contact message not found' });
        }

        // Mark as read if not already read
        if (!message.readAt) {
            message.readAt = new Date().toISOString();
            message.status = 'read';
        }

        res.json({ message });
    } catch (error) {
        console.error('❌ Error in getContactMessageById:', error);
        next(error);
    }
}

// Update contact message status (admin only)
function updateContactMessageStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, adminReply } = req.body;

        const messageIndex = contactMessages.findIndex(m => m._id === id);
        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Contact message not found' });
        }

        const message = contactMessages[messageIndex];

        if (status) {
            message.status = status;
        }

        if (adminReply) {
            message.adminReply = adminReply;
            message.repliedAt = new Date().toISOString();
            message.status = 'replied';

            // Create notification for the user about the admin reply
            if (message.userId) {
                console.log(`🔔 Creating notification for user ${message.userId} about admin reply`);
                createContactReplyNotification(message.userId, message._id, message.subject, adminReply);
            } else {
                console.log(`⚠️ No userId found for contact message ${id}, cannot create notification`);
            }
        }

        console.log(`✅ Contact message ${id} status updated to ${message.status}`);
        res.json({ message });
    } catch (error) {
        console.error('❌ Error in updateContactMessageStatus:', error);
        next(error);
    }
}

// Delete contact message (admin only)
function deleteContactMessage(req, res, next) {
    try {
        const { id } = req.params;
        const messageIndex = contactMessages.findIndex(m => m._id === id);

        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Contact message not found' });
        }

        const deletedMessage = contactMessages.splice(messageIndex, 1)[0];
        console.log(`✅ Contact message ${id} deleted`);

        res.json({ message: 'Contact message deleted successfully' });
    } catch (error) {
        console.error('❌ Error in deleteContactMessage:', error);
        next(error);
    }
}

// Get user's own contact messages
function getUserContactMessages(req, res, next) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Get messages for this specific user
        const userMessages = contactMessages.filter(m => m.userId === userId);

        console.log(`🔍 User ${userId} requested their contact messages. Found: ${userMessages.length}`);

        res.json({ messages: userMessages });
    } catch (error) {
        console.error('❌ Error in getUserContactMessages:', error);
        next(error);
    }
}

// Get all contact messages (for internal use)
function getContactMessages() {
    return contactMessages;
}

// Get contact statistics (admin only)
function getContactStats(req, res, next) {
    try {
        const totalMessages = contactMessages.length;
        const newMessages = contactMessages.filter(m => m.status === 'new').length;
        const readMessages = contactMessages.filter(m => m.status === 'read').length;
        const repliedMessages = contactMessages.filter(m => m.status === 'replied').length;
        const archivedMessages = contactMessages.filter(m => m.status === 'archived').length;

        const stats = {
            total: totalMessages,
            new: newMessages,
            read: readMessages,
            replied: repliedMessages,
            archived: archivedMessages
        };

        console.log(`✅ Contact stats retrieved: ${totalMessages} total messages`);
        res.json(stats);
    } catch (error) {
        console.error('❌ Error in getContactStats:', error);
        next(error);
    }
}

// Create a contact reply notification
function createContactReplyNotification(userId, messageId, subject, adminReply) {
    try {
        // Use the proper notification service
        const NotificationService = require('../utils/notificationService');

        NotificationService.createNotification(userId, 'contact_reply', {
            contactMessageId: messageId,
            contactSubject: subject,
            adminReply: adminReply,
            message: `Готвачът отговори на вашето съобщение "${subject}"`
        });

        console.log(`✅ Contact reply notification created for user ${userId}`);
        console.log(`📧 Subject: ${subject}`);

    } catch (error) {
        console.error('❌ Error creating contact reply notification:', error);
    }
}

module.exports = {
    submitContact,
    getAllContactMessages,
    getContactMessageById,
    updateContactMessageStatus,
    deleteContactMessage,
    getContactStats,
    getUserContactMessages,
    createContactReplyNotification,
    getContactMessages
};
