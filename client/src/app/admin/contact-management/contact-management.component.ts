import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    topic: string;
    userId: string | null;
    submittedAt: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    readAt: string | null;
    repliedAt: string | null;
    adminReply?: string;
}

@Component({
    selector: 'app-contact-management',
    templateUrl: './contact-management.component.html',
    styleUrls: ['./contact-management.component.scss']
})
export class ContactManagementComponent implements OnInit {
    contactMessages: ContactMessage[] = [];
    selectedMessage: ContactMessage | null = null;
    loading = false;
    error = '';
    success = '';
    replyText = '';
    filterStatus = 'all';
    searchTerm = '';

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadContactMessages();
    }

    loadContactMessages(): void {
        this.loading = true;
        console.log('🔍 Loading contact messages from /api/contact...');

        this.http.get<{ messages: ContactMessage[] }>('/api/contact', { withCredentials: true })
            .subscribe({
                next: (response) => {
                    console.log('✅ Contact messages loaded:', response);
                    this.contactMessages = response.messages || [];
                    this.loading = false;
                    console.log(`📧 Total messages: ${this.contactMessages.length}`);
                },
                error: (error) => {
                    console.error('❌ Error loading contact messages:', error);
                    this.error = 'Грешка при зареждане на съобщенията';
                    this.loading = false;
                }
            });
    }

    selectMessage(message: ContactMessage): void {
        this.selectedMessage = message;
        this.replyText = message.adminReply || '';

        // Mark as read if it's new
        if (message.status === 'new') {
            this.markAsRead(message._id);
        }
    }

    markAsRead(messageId: string): void {
        this.http.put(`/api/contact/${messageId}`, { status: 'read' }, { withCredentials: true })
            .subscribe({
                next: () => {
                    const message = this.contactMessages.find(m => m._id === messageId);
                    if (message) {
                        message.status = 'read';
                        message.readAt = new Date().toISOString();
                    }
                },
                error: (error) => {
                    console.error('Error marking message as read:', error);
                }
            });
    }

    sendReply(): void {
        if (!this.selectedMessage || !this.replyText.trim()) {
            return;
        }

        this.http.put(`/api/contact/${this.selectedMessage._id}`, {
            status: 'replied',
            adminReply: this.replyText.trim()
        }, { withCredentials: true })
            .subscribe({
                next: () => {
                    this.selectedMessage!.status = 'replied';
                    this.selectedMessage!.adminReply = this.replyText.trim();
                    this.selectedMessage!.repliedAt = new Date().toISOString();
                    this.success = 'Отговорът е изпратен успешно!';

                    // Update the message in the list
                    const messageIndex = this.contactMessages.findIndex(m => m._id === this.selectedMessage!._id);
                    if (messageIndex !== -1) {
                        this.contactMessages[messageIndex] = { ...this.selectedMessage! };
                    }

                    setTimeout(() => {
                        this.success = '';
                    }, 3000);
                },
                error: (error) => {
                    console.error('Error sending reply:', error);
                    this.error = 'Грешка при изпращане на отговора';
                    setTimeout(() => {
                        this.error = '';
                    }, 3000);
                }
            });
    }

    updateStatus(messageId: string, status: string): void {
        this.http.put(`/api/contact/${messageId}`, { status }, { withCredentials: true })
            .subscribe({
                next: () => {
                    const message = this.contactMessages.find(m => m._id === messageId);
                    if (message) {
                        message.status = status as any;
                    }
                    this.success = 'Статусът е обновен успешно!';
                    setTimeout(() => {
                        this.success = '';
                    }, 3000);
                },
                error: (error) => {
                    console.error('Error updating status:', error);
                    this.error = 'Грешка при обновяване на статуса';
                    setTimeout(() => {
                        this.error = '';
                    }, 3000);
                }
            });
    }

    deleteMessage(messageId: string): void {
        if (!confirm('Сигурни ли сте, че искате да изтриете това съобщение?')) {
            return;
        }

        this.http.delete(`/api/contact/${messageId}`, { withCredentials: true })
            .subscribe({
                next: () => {
                    this.contactMessages = this.contactMessages.filter(m => m._id !== messageId);
                    if (this.selectedMessage?._id === messageId) {
                        this.selectedMessage = null;
                        this.replyText = '';
                    }
                    this.success = 'Съобщението е изтрито успешно!';
                    setTimeout(() => {
                        this.success = '';
                    }, 3000);
                },
                error: (error) => {
                    console.error('Error deleting message:', error);
                    this.error = 'Грешка при изтриване на съобщението';
                    setTimeout(() => {
                        this.error = '';
                    }, 3000);
                }
            });
    }

    getFilteredMessages(): ContactMessage[] {
        let filtered = this.contactMessages;

        // Filter by status
        if (this.filterStatus !== 'all') {
            filtered = filtered.filter(m => m.status === this.filterStatus);
        }

        // Filter by search term
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(term) ||
                m.email.toLowerCase().includes(term) ||
                m.subject.toLowerCase().includes(term) ||
                m.message.toLowerCase().includes(term)
            );
        }

        return filtered;
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'new': return 'badge-new';
            case 'read': return 'badge-read';
            case 'replied': return 'badge-replied';
            case 'archived': return 'badge-archived';
            default: return 'badge-default';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'new': return 'Ново';
            case 'read': return 'Прочетено';
            case 'replied': return 'Отговорено';
            case 'archived': return 'Архивирано';
            default: return 'Неизвестно';
        }
    }

    getTopicText(topic: string): string {
        const topics: { [key: string]: string } = {
            'general': 'Общи въпроси',
            'cooking': 'Готвене и рецепти',
            'book': 'Моята книга',
            'courses': 'Курсове и обучения',
            'tips': 'Съвети за готвене',
            'other': 'Друго'
        };
        return topics[topic] || topic;
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString('bg-BG');
    }

    closeMessage(): void {
        this.selectedMessage = null;
        this.replyText = '';
    }
}
