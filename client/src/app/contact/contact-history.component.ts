import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface UserContactMessage {
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
    selector: 'app-contact-history',
    template: `
    <div class="contact-history-container">
      <div class="history-header">
        <h1>📧 История на вашите съобщения</h1>
        <p>Преглед на всички съобщения, които сте изпратили до Готвача</p>
      </div>

      <div class="history-content">
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Зареждане на съобщенията...</p>
        </div>

        <div *ngIf="!loading && messages.length === 0" class="no-messages">
          <div class="no-messages-icon">📭</div>
          <h3>Няма изпратени съобщения</h3>
          <p>Все още не сте изпращали съобщения до Готвача</p>
          <button (click)="goToContact()" class="contact-btn">📝 Изпрати съобщение</button>
        </div>

        <div *ngIf="!loading && messages.length > 0" class="messages-list">
          <div *ngFor="let message of messages" class="message-card" [class.has-reply]="message.adminReply">
            <div class="message-header">
              <div class="message-info">
                <h3 class="message-subject">{{ message.subject }}</h3>
                <div class="message-meta">
                  <span class="message-topic">{{ getTopicText(message.topic) }}</span>
                  <span class="message-date">{{ formatDate(message.submittedAt) }}</span>
                </div>
              </div>
              <div class="message-status">
                <span class="status-badge" [class]="getStatusBadgeClass(message.status)">
                  {{ getStatusText(message.status) }}
                </span>
              </div>
            </div>

            <div class="message-content">
              <h4>Вашето съобщение:</h4>
              <p>{{ message.message }}</p>
            </div>

            <div *ngIf="message.adminReply" class="chef-reply">
              <div class="reply-header">
                <h4>👨‍🍳 Отговор от Готвача:</h4>
                <span class="reply-date">{{ formatDate(message.repliedAt!) }}</span>
              </div>
              <div class="reply-content">
                {{ message.adminReply }}
              </div>
            </div>

            <div *ngIf="!message.adminReply && message.status === 'replied'" class="pending-reply">
              <p class="pending-text">⏳ Готвачът е отговорил на вашето съобщение. Отговорът ще бъде показан скоро.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .contact-history-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .history-header {
      text-align: center;
      background: white;
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

      h1 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
        font-size: 2.5rem;
        font-weight: 700;
      }

      p {
        margin: 0;
        color: #7f8c8d;
        font-size: 1.1rem;
      }
    }

    .loading-state {
      text-align: center;
      padding: 3rem;

      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem auto;
      }

      p {
        color: #666;
        margin: 0;
      }
    }

    .no-messages {
      text-align: center;
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

      .no-messages-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
      }

      p {
        margin: 0 0 2rem 0;
        color: #7f8c8d;
      }

      .contact-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 25px;
        font-size: 1.1rem;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .message-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &.has-reply {
        border-left: 4px solid #28a745;
      }
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;

      .message-info {
        flex: 1;

        .message-subject {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .message-meta {
          display: flex;
          gap: 1rem;
          align-items: center;

          .message-topic {
            background: #e9ecef;
            color: #495057;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.9rem;
          }

          .message-date {
            color: #6c757d;
            font-size: 0.9rem;
          }
        }
      }

      .message-status {
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;

          &.status-new {
            background: rgba(0, 123, 255, 0.2);
            color: #007bff;
          }

          &.status-read {
            background: rgba(40, 167, 69, 0.2);
            color: #28a745;
          }

          &.status-replied {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
          }

          &.status-archived {
            background: rgba(108, 117, 125, 0.2);
            color: #6c757d;
          }
        }
      }
    }

    .message-content {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 10px;

      h4 {
        margin: 0 0 0.5rem 0;
        color: #495057;
        font-size: 1rem;
      }

      p {
        margin: 0;
        color: #6c757d;
        line-height: 1.6;
      }
    }

    .chef-reply {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 10px;
      padding: 1rem;

      .reply-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        h4 {
          margin: 0;
          color: #155724;
          font-size: 1rem;
        }

        .reply-date {
          color: #155724;
          font-size: 0.8rem;
        }
      }

      .reply-content {
        color: #155724;
        line-height: 1.6;
        margin: 0;
      }
    }

    .pending-reply {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 10px;
      padding: 1rem;

      .pending-text {
        margin: 0;
        color: #856404;
        text-align: center;
        font-style: italic;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .contact-history-container {
        padding: 1rem;
      }

      .message-header {
        flex-direction: column;
        gap: 1rem;

        .message-status {
          align-self: flex-start;
        }
      }
    }
  `]
})
export class ContactHistoryComponent implements OnInit {
    messages: UserContactMessage[] = [];
    loading = true;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadUserMessages();
    }

    loadUserMessages(): void {
        this.loading = true;

        // Get current user ID
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            this.loading = false;
            return;
        }

        const user = JSON.parse(currentUser);
        const userId = user._id;

        // Get user's contact messages
        this.http.get<{ messages: UserContactMessage[] }>(`/api/contact/user/${userId}`, { withCredentials: true })
            .subscribe({
                next: (response) => {
                    this.messages = response.messages || [];
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading user messages:', error);
                    this.loading = false;
                }
            });
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

    getStatusText(status: string): string {
        const statuses: { [key: string]: string } = {
            'new': 'Ново',
            'read': 'Прочетено',
            'replied': 'Отговорено',
            'archived': 'Архивирано'
        };
        return statuses[status] || status;
    }

    getStatusBadgeClass(status: string): string {
        return `status-${status}`;
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    goToContact(): void {
        // Navigate to contact form
        window.location.href = '/contact';
    }
}
