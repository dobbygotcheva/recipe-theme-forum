import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-recipe-detail',
  template: `
    <div class="recipe-detail-container">
      <div *ngIf="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p>Зареждане на рецепта...</p>
      </div>
      
      <div *ngIf="error" class="error-section">
        <div class="error-icon">❌</div>
        <h3>Възникна грешка</h3>
        <p>{{ error }}</p>
        <button (click)="goBack()" class="back-button">Назад към рецептите</button>
      </div>
      
      <div *ngIf="recipe" class="recipe-content">
        <!-- Header with back button -->
        <div class="recipe-header">
          <button (click)="goBack()" class="back-btn">
            ← Назад към рецептите
          </button>
          <div class="recipe-category">{{ recipe.category }}</div>
        </div>
        
        <!-- Recipe Image and Title -->
        <div class="recipe-hero">
          <img [src]="recipe.img" [alt]="recipe.title" class="recipe-image" />
          <div class="recipe-hero-content">
            <h1 class="recipe-title">{{ recipe.title }}</h1>
            
            <div class="recipe-meta">
              <div class="meta-item">
                <span class="meta-icon">⏰</span>
                <span>{{ recipe.time }} минути</span>
              </div>
              
              <div class="meta-item" *ngIf="recipe.averageRating">
                <span class="meta-icon">⭐</span>
                <span>{{ recipe.averageRating | number:'1.1-1' }} ({{ recipe.totalRatings }} оценки)</span>
              </div>
            </div>

            <!-- Nutritional Information -->
            <div class="nutritional-section" *ngIf="recipe.protein || recipe.fats || recipe.carbs || recipe.calories">
              <h3>🥗 Хранителна информация</h3>
              <div class="nutritional-grid">
                <div class="nutrition-item" *ngIf="recipe.calories">
                  <div class="nutrition-icon">🔥</div>
                  <div class="nutrition-content">
                    <div class="nutrition-value">{{ recipe.calories }}</div>
                    <div class="nutrition-label">калории</div>
                  </div>
                </div>
                <div class="nutrition-item" *ngIf="recipe.protein">
                  <div class="nutrition-icon">💪</div>
                  <div class="nutrition-content">
                    <div class="nutrition-value">{{ recipe.protein }}g</div>
                    <div class="nutrition-label">протеини</div>
                  </div>
                </div>
                <div class="nutrition-item" *ngIf="recipe.fats">
                  <div class="nutrition-icon">🥑</div>
                  <div class="nutrition-content">
                    <div class="nutrition-value">{{ recipe.fats }}g</div>
                    <div class="nutrition-label">мазнини</div>
                  </div>
                </div>
                <div class="nutrition-item" *ngIf="recipe.carbs">
                  <div class="nutrition-icon">🍞</div>
                  <div class="nutrition-content">
                    <div class="nutrition-value">{{ recipe.carbs }}g</div>
                    <div class="nutrition-label">въглехидрати</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Actions -->
        <div class="interactive-actions" *ngIf="currentUser">
          <div class="action-group">
            <!-- Rating -->
            <div class="rating-section">
              <h3>Оцени рецептата:</h3>
              <div class="rating-stars">
                <span 
                  *ngFor="let star of [1,2,3,4,5]; let i = index" 
                  (click)="rateRecipe(star)"
                  [class]="'star ' + (i < userRating ? 'filled' : 'empty')"
                  class="clickable-star">
                  ★
                </span>
              </div>
              <span class="rating-text" *ngIf="userRating">Вашата оценка: {{ userRating }}/5</span>
            </div>

            <!-- Like/Dislike -->
            <div class="like-section">
              <button 
                (click)="likeRecipe('like')" 
                [class]="'like-btn ' + (userLiked ? 'liked' : '')"
                class="action-btn">
                👍 {{ recipe.likes?.length || 0 }}
              </button>
              <button 
                (click)="likeRecipe('dislike')" 
                [class]="'dislike-btn ' + (userDisliked ? 'disliked' : '')"
                class="action-btn">
                👎 {{ recipe.dislikes?.length || 0 }}
              </button>
            </div>

            <!-- Favorite -->
            <div class="favorite-section">
              <button 
                (click)="toggleFavorite()" 
                [class]="'favorite-btn ' + (isFavorite ? 'favorited' : '')"
                class="action-btn">
                {{ isFavorite ? '❤️' : '🤍' }} Любима
              </button>
            </div>
          </div>
        </div>
        
        <!-- Ingredients Section -->
        <div class="recipe-section">
          <h2 class="section-title">🛒 Съставки</h2>
          <div class="ingredients-box">
            <p>{{ recipe.ingredients }}</p>
          </div>
        </div>
        
        <!-- Instructions Section -->
        <div class="recipe-section">
          <h2 class="section-title">📝 Инструкции</h2>
          <div class="instructions-box">
            <ol class="instructions-list">
              <li *ngFor="let step of getInstructionSteps()">{{ step }}</li>
            </ol>
          </div>
        </div>

        <!-- Video Section -->
        <div class="recipe-section" *ngIf="recipe.videoUrl">
          <h2 class="section-title">🎥 Видео</h2>
          <div class="video-container">
            <iframe 
              [src]="getSafeVideoUrl()" 
              frameborder="0" 
              allowfullscreen
              class="recipe-video">
            </iframe>
          </div>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
          <h2 class="section-title">💬 Коментари</h2>
          
          <!-- Add Comment Form -->
          <div class="add-comment-form" *ngIf="currentUser">
            <div class="form-header">
              <span class="form-title">Добавете нов коментар</span>
            </div>
            <textarea 
              [(ngModel)]="newCommentText" 
              placeholder="Споделете вашите мисли за тази рецепта..."
              class="comment-input"
              rows="4">
            </textarea>
            <div class="form-actions">
              <button 
                (click)="addComment()"
                class="submit-btn primary"
                [disabled]="!newCommentText.trim()">
                💬 Публикувай коментар
              </button>
            </div>
          </div>

          <!-- Comments List -->
          <div class="comments-list" *ngIf="getTopLevelComments().length > 0">
            <div class="comment-item" *ngFor="let comment of getTopLevelComments()">
              <div class="comment-content">
                <div class="comment-header">
                  <div class="user-info">
                    <div class="avatar">{{ comment.username.charAt(0).toUpperCase() }}</div>
                    <div class="user-details">
                      <span class="username">{{ comment.username }}</span>
                      <span class="timestamp">{{ formatDate(comment.created_at) }}</span>
                    </div>
                  </div>
                  <div class="comment-actions">
                    <button 
                      *ngIf="canDeleteComment(comment)"
                      (click)="deleteComment(comment._id)" 
                      class="action-btn delete"
                      title="Изтрий коментар">
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div class="comment-text">{{ comment.text }}</div>
                
                <div class="interaction-bar">
                  <div class="reactions">
                    <button 
                      (click)="likeComment(comment._id)"
                      [class]="'reaction-btn ' + (isCommentLiked(comment) ? 'liked' : '')"
                      title="Харесай">
                      👍 <span class="count">{{ comment.likes?.length || 0 }}</span>
                    </button>
                    <button 
                      (click)="dislikeComment(comment._id)"
                      [class]="'reaction-btn ' + (isCommentDisliked(comment) ? 'disliked' : '')"
                      title="Не харесай">
                      👎 <span class="count">{{ comment.dislikes?.length || 0 }}</span>
                    </button>
                  </div>
                  <button 
                    (click)="toggleReplyForm(comment._id)"
                    class="reply-btn"
                    [class]="'active' + (comment.showReplyForm ? ' active' : '')">
                    💬 Отговори
                  </button>
                </div>

                <!-- Reply Form -->
                <div class="reply-form" *ngIf="comment.showReplyForm">
                  <div class="form-header">
                    <span class="form-title">Отговаряте на {{ comment.username }}</span>
                  </div>
                  <textarea 
                    [(ngModel)]="comment.replyText" 
                    placeholder="Напишете вашия отговор..."
                    class="reply-input"
                    rows="3">
                  </textarea>
                  <div class="form-actions">
                    <button 
                      (click)="addReply(comment._id, comment.replyText)"
                      class="submit-btn"
                      [disabled]="!comment.replyText?.trim()">
                      💬 Отговори
                    </button>
                    <button 
                      (click)="cancelReply(comment._id)"
                      class="cancel-btn">
                      Отказ
                    </button>
                  </div>
                </div>

                <!-- Replies Container -->
                <div class="replies-container" *ngIf="comment.replies && comment.replies.length > 0">
                  <div class="replies-header">
                    <span class="replies-count">{{ comment.replies.length }} отговора</span>
                  </div>
                  
                  <!-- Recursive Replies Template -->
                  <ng-container *ngTemplateOutlet="replyTemplate; context: { replies: comment.replies, level: 1 }"></ng-container>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recursive Reply Template -->
    <ng-template #replyTemplate let-replies="replies" let-level="level">
      <div class="reply-item level-{{ level }}" *ngFor="let reply of replies">
        <div class="reply-content">
          <div class="reply-header">
            <div class="user-info">
              <div class="avatar" [class]="'level-' + level">{{ reply.username.charAt(0).toUpperCase() }}</div>
              <div class="user-details">
                <span class="username">{{ reply.username }}</span>
                <span class="timestamp">{{ formatDate(reply.created_at) }}</span>
              </div>
            </div>
            <div class="reply-actions">
              <button 
                *ngIf="canDeleteComment(reply)"
                (click)="deleteComment(reply._id)" 
                class="action-btn delete"
                [class]="'level-' + level"
                title="Изтрий отговора">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="reply-text">{{ reply.text }}</div>
          
          <div class="interaction-bar">
            <div class="reactions">
              <button 
                (click)="likeComment(reply._id)"
                [class]="'reaction-btn ' + (isCommentLiked(reply) ? 'liked' : '')"
                [class]="'level-' + level"
                title="Харесай">
                👍 <span class="count">{{ reply.likes?.length || 0 }}</span>
              </button>
              <button 
                (click)="dislikeComment(reply._id)"
                [class]="'reaction-btn ' + (isCommentDisliked(reply) ? 'disliked' : '')"
                [class]="'level-' + level"
                title="Не харесай">
                👎 <span class="count">{{ reply.dislikes?.length || 0 }}</span>
              </button>
            </div>
            <button 
              (click)="toggleReplyForm(reply._id)"
              class="reply-btn"
              [class]="'level-' + level"
              [class]="'active' + (reply.showReplyForm ? ' active' : '')">
              💬 Отговори
            </button>
          </div>

          <!-- Reply Form -->
          <div class="reply-form" *ngIf="reply.showReplyForm">
            <div class="form-header">
              <span class="form-title">Отговаряте на {{ reply.username }}</span>
            </div>
            <textarea 
              [(ngModel)]="reply.replyText" 
              placeholder="Напишете вашия отговор..."
              class="reply-input"
              rows="3">
            </textarea>
            <div class="form-actions">
              <button 
                (click)="addReply(reply._id, reply.replyText)"
                class="submit-btn"
                [disabled]="!reply.replyText?.trim()">
                💬 Отговори
              </button>
              <button 
                (click)="cancelReply(reply._id)"
                class="cancel-btn">
                Отказ
              </button>
            </div>
          </div>

          <!-- Recursive Nested Replies -->
          <div class="nested-replies" *ngIf="reply.replies && reply.replies.length > 0">
            <ng-container *ngTemplateOutlet="replyTemplate; context: { replies: reply.replies, level: level + 1 }"></ng-container>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- No Comments Message -->
    <div class="no-comments" *ngIf="getTopLevelComments().length === 0">
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>Все още няма коментари</h3>
        <p>Бъдете първият, който ще сподели мнението си за тази рецепта!</p>
      </div>
    </div>
`,
  styles: [`
     .recipe-detail-container {
       max-width: 800px;
       margin: 0 auto;
       padding: 2rem;
     }

     .loading-section {
       text-align: center;
       padding: 3rem 0;
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

     .error-section {
       text-align: center;
       padding: 3rem 0;
       background: white;
       border-radius: 15px;
       box-shadow: 0 5px 20px rgba(0,0,0,0.1);
     }

     .error-icon {
       font-size: 3rem;
       margin-bottom: 1rem;
     }

     .back-button, .back-btn {
       background: #667eea;
       color: white;
       border: none;
       padding: 0.8rem 1.5rem;
       border-radius: 25px;
       cursor: pointer;
       font-weight: 600;
       transition: background 0.3s ease;
       text-decoration: none;
       display: inline-block;
     }

     .back-button:hover, .back-btn:hover {
       background: #5a67d8;
     }

     .recipe-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 2rem;
     }

     .recipe-category {
       background: #667eea;
       color: white;
       padding: 0.5rem 1rem;
       border-radius: 20px;
       font-weight: 600;
     }

     .recipe-hero {
       background: white;
       border-radius: 15px;
       overflow: hidden;
       box-shadow: 0 5px 20px rgba(0,0,0,0.1);
       margin-bottom: 2rem;
     }

     .recipe-image {
       width: 100%;
       height: 300px;
       object-fit: cover;
     }

     .recipe-hero-content {
       padding: 2rem;
     }

     .recipe-title {
       font-size: 2.5rem;
       color: #2c3e50;
       margin: 0 0 1rem 0;
     }

     .recipe-meta {
       display: flex;
       gap: 2rem;
     }

     .meta-item {
       display: flex;
       align-items: center;
       gap: 0.5rem;
       color: #7f8c8d;
     }

     .meta-icon {
       font-size: 1.2rem;
     }

     .nutritional-section {
       margin-top: 1.5rem;
       padding-top: 1.5rem;
       border-top: 1px solid #e9ecef;

       h3 {
         margin: 0 0 1rem 0;
         color: #2c3e50;
         font-size: 1.2rem;
         font-weight: 600;
       }

       .nutritional-grid {
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
         gap: 1rem;
       }

       .nutrition-item {
         display: flex;
         align-items: center;
         gap: 0.75rem;
         padding: 1rem;
         background: #f8f9fa;
         border-radius: 12px;
         border: 1px solid #e9ecef;
         transition: all 0.3s ease;
         text-align: center;

         &:hover {
           transform: translateY(-3px);
           box-shadow: 0 6px 20px rgba(0,0,0,0.1);
           background: white;
         }

         .nutrition-icon {
           font-size: 1.5rem;
         }

         .nutrition-content {
           flex: 1;
         }

         .nutrition-value {
           font-size: 1.2rem;
           font-weight: 700;
           color: #2c3e50;
           margin-bottom: 0.25rem;
         }

         .nutrition-label {
           font-size: 0.8rem;
           color: #7f8c8d;
           text-transform: uppercase;
           letter-spacing: 0.5px;
         }
       }
     }

     .interactive-actions {
       background: white;
       border-radius: 15px;
       padding: 2rem;
       box-shadow: 0 5px 20px rgba(0,0,0,0.1);
       margin-bottom: 2rem;
     }

     .action-group {
       display: flex;
       justify-content: space-around;
       align-items: center;
       flex-wrap: wrap;
       gap: 2rem;
     }

     .rating-section, .like-section, .favorite-section {
       text-align: center;
     }

     .rating-section h3 {
       margin: 0 0 1rem 0;
       color: #2c3e50;
       font-size: 1.1rem;
     }

     .rating-stars {
       display: flex;
       gap: 0.25rem;
       justify-content: center;
       margin-bottom: 0.5rem;
     }

     .star {
       font-size: 1.5rem;
       cursor: pointer;
       transition: color 0.3s ease;
     }

     .star.filled {
       color: #f39c12;
     }

     .star.empty {
       color: #ddd;
     }

     .clickable-star:hover {
       color: #f39c12;
     }

     .rating-text {
       font-size: 0.9rem;
       color: #7f8c8d;
     }

     .action-btn {
       background: #f8f9fa;
       border: 2px solid #e9ecef;
       color: #6c757d;
       padding: 0.75rem 1.5rem;
       border-radius: 25px;
       cursor: pointer;
       font-weight: 600;
       transition: all 0.3s ease;
       margin: 0 0.5rem;
     }

     .action-btn:hover {
       transform: translateY(-2px);
       box-shadow: 0 4px 15px rgba(0,0,0,0.1);
     }

     .like-btn.liked {
       background: rgba(39, 174, 96, 0.2);
       border-color: #27ae60;
       color: #27ae60;
     }

     .dislike-btn.disliked {
       background: rgba(231, 76, 60, 0.2);
       border-color: #e74c3c;
       color: #e74c3c;
     }

     .favorite-btn.favorited {
       background: rgba(231, 76, 60, 0.2);
       border-color: #e74c3c;
       color: #e74c3c;
     }

     .recipe-section {
       background: white;
       border-radius: 15px;
       padding: 2rem;
       box-shadow: 0 5px 20px rgba(0,0,0,0.1);
       margin-bottom: 2rem;
     }

     .section-title {
       color: #2c3e50;
       margin: 0 0 1.5rem 0;
       font-size: 1.5rem;
     }

     .ingredients-box, .instructions-box {
       background: #f8f9fa;
       border-radius: 10px;
       padding: 1.5rem;
     }

     .instructions-list {
       line-height: 1.8;
       color: #2c3e50;
       margin: 0;
       padding-left: 1.5rem;
     }

     .instructions-list li {
       margin-bottom: 0.5rem;
     }

     .video-container {
       position: relative;
       width: 100%;
       height: 0;
       padding-bottom: 56.25%;
       border-radius: 10px;
       overflow: hidden;
     }

     .recipe-video {
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
     }

     /* ===== COMMENTS SECTION ===== */
     .comments-section {
       margin-top: 3rem;
       padding: 2rem;
       background: white;
       border-radius: 20px;
       box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
     }

     .section-title {
       font-size: 2rem;
       color: #1a202c;
       margin-bottom: 2.5rem;
       text-align: center;
       font-weight: 800;
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
       background-clip: text;
     }

     /* Add Comment Form */
     .add-comment-form {
       margin-bottom: 2.5rem;
       padding: 2rem;
       background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
       border-radius: 16px;
       border: 2px solid #e2e8f0;
       position: relative;
       overflow: hidden;
     }

     .add-comment-form::before {
       content: '';
       position: absolute;
       top: 0;
       left: 0;
       right: 0;
       height: 4px;
       background: linear-gradient(90deg, #667eea, #764ba2);
     }

     .form-header {
       margin-bottom: 1rem;
     }

     .form-title {
       font-size: 1.2rem;
       font-weight: 700;
       color: #2d3748;
     }

     .comment-input {
       width: 100%;
       padding: 1.2rem;
       border: 2px solid #e2e8f0;
       border-radius: 12px;
       font-family: inherit;
       font-size: 1rem;
       resize: vertical;
       margin-bottom: 1.5rem;
       transition: all 0.3s ease;
       background: white;
     }

     .comment-input:focus {
       outline: none;
       border-color: #667eea;
       box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
       transform: translateY(-2px);
     }

     .form-actions {
       display: flex;
       gap: 1rem;
       justify-content: flex-end;
     }

     .submit-btn {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       color: white;
       border: none;
       padding: 0.875rem 1.75rem;
       border-radius: 25px;
       cursor: pointer;
       font-weight: 700;
       font-size: 1rem;
       transition: all 0.3s ease;
       box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
     }

     .submit-btn:hover:not(:disabled) {
       transform: translateY(-3px);
       box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
     }

     .submit-btn:disabled {
       opacity: 0.6;
       cursor: not-allowed;
       transform: none;
     }

     .submit-btn.primary {
       background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
       box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
     }

     .submit-btn.primary:hover:not(:disabled) {
       box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
     }

     .cancel-btn {
       background: #718096;
       color: white;
       border: none;
       padding: 0.875rem 1.75rem;
       border-radius: 25px;
       cursor: pointer;
       font-weight: 600;
       font-size: 1rem;
       transition: all 0.3s ease;
     }

     .cancel-btn:hover {
       background: #4a5568;
       transform: translateY(-2px);
     }

     /* Comments List */
     .comments-list {
       display: flex;
       flex-direction: column;
       gap: 2rem;
     }

     .comment-item {
       background: white;
       border-radius: 16px;
       border: 1px solid #e2e8f0;
       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
       transition: all 0.3s ease;
       overflow: hidden;
     }

     .comment-item:hover {
       box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
       transform: translateY(-4px);
     }

     .comment-content {
       padding: 1.5rem;
     }

     .comment-header {
       display: flex;
       justify-content: space-between;
       align-items: flex-start;
       margin-bottom: 1.25rem;
     }

     .user-info {
       display: flex;
       align-items: center;
       gap: 1rem;
     }

     .avatar {
       width: 48px;
       height: 48px;
       border-radius: 50%;
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       color: white;
       display: flex;
       align-items: center;
       justify-content: center;
       font-weight: 700;
       font-size: 1.2rem;
       box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
     }

     .user-details {
       display: flex;
       flex-direction: column;
       gap: 0.25rem;
     }

     .username {
       font-weight: 700;
       color: #2d3748;
       font-size: 1.1rem;
     }

     .timestamp {
       font-size: 0.875rem;
       color: #718096;
     }

     .comment-text {
       color: #4a5568;
       line-height: 1.7;
       margin-bottom: 1.5rem;
       font-size: 1.05rem;
       padding: 0 0.5rem;
     }

     .interaction-bar {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 1rem 0;
       border-top: 1px solid #f7fafc;
     }

     .reactions {
       display: flex;
       gap: 0.75rem;
     }

     .reaction-btn {
       background: #f7fafc;
       border: 1px solid #e2e8f0;
       color: #4a5568;
       padding: 0.625rem 1rem;
       border-radius: 20px;
       cursor: pointer;
       font-size: 0.9rem;
       transition: all 0.3s ease;
       font-weight: 600;
       display: flex;
       align-items: center;
       gap: 0.5rem;
     }

     .reaction-btn:hover {
       background: #edf2f7;
       border-color: #cbd5e0;
       transform: translateY(-2px);
     }

     .reaction-btn.liked {
       background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
       border-color: #48bb78;
       color: white;
       box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
     }

     .reaction-btn.disliked {
       background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
       border-color: #f56565;
       color: white;
       box-shadow: 0 4px 15px rgba(245, 101, 101, 0.3);
     }

     .count {
       font-weight: 700;
     }

     .reply-btn {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       border: none;
       color: white;
       padding: 0.625rem 1.25rem;
       border-radius: 20px;
       cursor: pointer;
       font-size: 0.9rem;
       transition: all 0.3s ease;
       font-weight: 600;
       box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
     }

     .reply-btn:hover {
       transform: translateY(-2px);
       box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
     }

     .reply-btn.active {
       background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
       box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
     }

     /* Reply Form */
     .reply-form {
       margin-top: 1.5rem;
       padding: 1.5rem;
       background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
       border-radius: 12px;
       border-left: 4px solid #667eea;
       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
       animation: slideDown 0.4s ease;
     }

     @keyframes slideDown {
       from {
         opacity: 0;
         transform: translateY(-15px);
       }
       to {
         opacity: 1;
         transform: translateY(0);
       }
     }

     .reply-input {
       width: 100%;
       padding: 1rem;
       border: 2px solid #e2e8f0;
       border-radius: 10px;
       font-family: inherit;
       font-size: 0.95rem;
       resize: vertical;
       margin-bottom: 1rem;
       background: white;
       transition: all 0.3s ease;
     }

     .reply-input:focus {
       outline: none;
       border-color: #667eea;
       box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
     }

     /* Replies Container */
     .replies-container {
       margin-left: 2.5rem;
       margin-top: 1.5rem;
       border-left: 4px solid #667eea;
       padding-left: 2rem;
       background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
       border-radius: 0 12px 12px 0;
       position: relative;
     }

     .replies-container::before {
       content: '';
       position: absolute;
       left: -4px;
       top: 0;
       bottom: 0;
       width: 4px;
       background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
       border-radius: 2px;
     }

     .replies-header {
       margin-bottom: 1.5rem;
       padding: 0.75rem 0;
       border-bottom: 1px solid rgba(102, 126, 234, 0.2);
     }

     .replies-count {
       font-size: 1rem;
       color: #667eea;
       font-weight: 700;
       text-transform: uppercase;
       letter-spacing: 0.5px;
     }

     /* Reply Items */
     .reply-item {
       background: white;
       border-radius: 12px;
       padding: 1.25rem;
       margin-bottom: 1.25rem;
       border: 1px solid #e2e8f0;
       box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
       transition: all 0.3s ease;
     }

     .reply-item:hover {
       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
       transform: translateY(-2px);
     }

     /* Level-based styling for unlimited nesting */
     .reply-item.level-1 {
       margin-left: 1rem;
       background: #f8f9fa;
       border-left: 4px solid #667eea;
     }

     .reply-item.level-2 {
       margin-left: 2rem;
       background: #f1f3f4;
       border-left: 4px solid #48bb78;
       font-size: 0.95rem;
     }

     .reply-item.level-3 {
       margin-left: 3rem;
       background: #e8eaed;
       border-left: 4px solid #ed8936;
       font-size: 0.9rem;
     }

     .reply-item.level-4 {
       margin-left: 4rem;
       background: #dfe3e6;
       border-left: 4px solid #e53e3e;
       font-size: 0.85rem;
     }

     .reply-item.level-5 {
       margin-left: 5rem;
       background: #d6d9dc;
       border-left: 4px solid #9f7aea;
       font-size: 0.8rem;
     }

     /* Avatar sizing by level */
     .avatar.level-1 {
       width: 40px;
       height: 40px;
       font-size: 1.2rem;
     }

     .avatar.level-2 {
       width: 35px;
       height: 35px;
       font-size: 1.1rem;
     }

     .avatar.level-3 {
       width: 30px;
       height: 30px;
       font-size: 1rem;
     }

     .avatar.level-4 {
       width: 25px;
       height: 25px;
       font-size: 0.9rem;
     }

     .avatar.level-5 {
       width: 20px;
       height: 20px;
       font-size: 0.8rem;
     }

     /* Button sizing by level */
     .reply-btn.level-1 {
       font-size: 0.95rem;
       padding: 0.5rem 1rem;
     }

     .reply-btn.level-2 {
       font-size: 0.9rem;
       padding: 0.45rem 0.9rem;
     }

     .reply-btn.level-3 {
       font-size: 0.85rem;
       padding: 0.4rem 0.8rem;
     }

     .reply-btn.level-4 {
       font-size: 0.8rem;
       padding: 0.35rem 0.7rem;
     }

     .reply-btn.level-5 {
       font-size: 0.75rem;
       padding: 0.3rem 0.6rem;
     }

     /* Action button sizing by level */
     .action-btn.level-1 {
       font-size: 0.9rem;
       padding: 0.4rem;
     }

     .action-btn.level-2 {
       font-size: 0.85rem;
       padding: 0.35rem;
     }

     .action-btn.level-3 {
       font-size: 0.8rem;
       padding: 0.3rem;
     }

     .action-btn.level-4 {
       font-size: 0.75rem;
       padding: 0.25rem;
     }

     .action-btn.level-5 {
       font-size: 0.7rem;
       padding: 0.2rem;
     }

     .reply-content {
       padding: 0.5rem;
     }

     .reply-header {
       display: flex;
       justify-content: space-between;
       align-items: flex-start;
       margin-bottom: 1rem;
     }

     .reply-text {
       color: #4a5568;
       line-height: 1.6;
       margin-bottom: 1rem;
       font-size: 1rem;
       padding: 0 0.5rem;
     }

     /* Nested Replies */
     .nested-replies {
       margin-left: 2rem;
       margin-top: 1.25rem;
       border-left: 3px solid #48bb78;
       padding-left: 1.5rem;
       background: linear-gradient(135deg, rgba(72, 187, 120, 0.05) 0%, rgba(56, 161, 105, 0.05) 100%);
       border-radius: 0 10px 10px 0;
       position: relative;
     }

     .nested-replies::before {
       content: '';
       position: absolute;
       left: -3px;
       top: 0;
       bottom: 0;
       width: 3px;
       background: linear-gradient(180deg, #48bb78 0%, #38a169 100%);
       border-radius: 1.5px;
     }

     /* Action Buttons */
     .action-btn {
       background: #f7fafc;
       border: 1px solid #e2e8f0;
       color: #4a5568;
       padding: 0.5rem;
       border-radius: 8px;
       cursor: pointer;
       font-size: 0.9rem;
       transition: all 0.3s ease;
     }

     .action-btn:hover {
       background: #edf2f7;
       transform: scale(1.1);
     }

     .action-btn.delete {
       background: #fed7d7;
       border-color: #feb2b2;
       color: #c53030;
     }

     .action-btn.delete:hover {
       background: #feb2b2;
     }

     /* No Comments State */
     .no-comments {
       text-align: center;
       padding: 3rem 2rem;
     }

     .empty-state {
       display: flex;
       flex-direction: column;
       align-items: center;
       gap: 1.5rem;
     }

     .empty-icon {
       font-size: 4rem;
       opacity: 0.6;
     }

     .empty-state h3 {
       font-size: 1.5rem;
       color: #2d3748;
       font-weight: 700;
       margin: 0;
     }

     .empty-state p {
       font-size: 1.1rem;
       color: #718096;
       margin: 0;
       line-height: 1.6;
     }

     /* Responsive Design */
     @media (max-width: 768px) {
       .recipe-detail-container {
       padding: 1rem;
       }

       .comments-section {
         padding: 1.5rem;
     }

     .replies-container {
       margin-left: 1.5rem;
       padding-left: 1rem;
       }

       .reply-item.level-1 {
         margin-left: 0.5rem;
       }

       .reply-item.level-2 {
         margin-left: 1rem;
       }

       .reply-item.level-3 {
       margin-left: 1.5rem;
       }

       .reply-item.level-4 {
         margin-left: 2rem;
       }

       .reply-item.level-5 {
         margin-left: 2.5rem;
       }

       .interaction-bar {
         flex-direction: column;
         gap: 1rem;
         align-items: stretch;
       }

       .reactions {
         justify-content: center;
       }

       .reply-btn {
         align-self: center;
       }
     }

     @media (max-width: 480px) {
       .comment-content {
         padding: 1rem;
       }

       .reply-item {
         padding: 1rem;
       }

       .add-comment-form {
         padding: 1.5rem;
       }

       .form-actions {
         flex-direction: column;
         gap: 0.75rem;
       }

       .submit-btn, .cancel-btn {
       width: 100%;
       }
     }
   `]
})
export class RecipeDetailComponent implements OnInit {

  recipe: any = null;
  loading = true;
  error: string | null = null;
  currentUser: any = null;
  userRating: number = 0;
  userLiked: boolean = false;
  userDisliked: boolean = false;
  isFavorite: boolean = false;
  newCommentText: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    console.log('RecipeDetailComponent ngOnInit called');
    this.loadCurrentUser();
    this.loadRecipe();
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  loadRecipe() {
    console.log('loadRecipe called');
    this.loading = true;
    this.error = '';

    const themeId = this.route.snapshot.paramMap.get('id');
    console.log('Theme ID from route:', themeId);
    if (!themeId) {
      this.error = 'Recipe ID not found';
      this.loading = false;
      return;
    }

    // Load recipe data
    this.http.get(`/api/themes/${themeId}`, { withCredentials: true }).subscribe({
      next: (recipe: any) => {
        this.recipe = recipe;

        // Load comments with hierarchical structure
        console.log('Loading comments for theme:', themeId);
        this.http.get(`/api/ratings/${themeId}/comments`, { withCredentials: true }).subscribe({
          next: (commentsResponse: any) => {
            console.log('Comments loaded:', commentsResponse);
            this.recipe.comments = commentsResponse.comments || [];
            console.log('Recipe comments set:', this.recipe.comments);
            this.loading = false;
            this.checkUserInteractions();
          },
          error: (err) => {
            console.error('Error loading comments:', err);
            this.recipe.comments = [];
            this.loading = false;
            this.checkUserInteractions();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Грешка при зареждане на рецептата. Моля, опитайте отново.';
        console.error('Error loading recipe:', err);
      }
    });
  }

  fetchRecipe() {
    // Alias for loadRecipe to maintain consistency with other components
    this.loadRecipe();
  }

  checkUserInteractions() {
    if (!this.currentUser) return;

    // Check user's rating
    const userRating = this.recipe.ratings?.find((r: any) => r.userId === this.currentUser._id);
    if (userRating) {
      this.userRating = userRating.rating;
    }

    // Check if user liked/disliked
    this.userLiked = this.recipe.likes?.includes(this.currentUser._id) || false;
    this.userDisliked = this.recipe.dislikes?.includes(this.currentUser._id) || false;

    // Check if user favorited
    this.isFavorite = this.recipe.favorites?.includes(this.currentUser._id) || false;
  }

  rateRecipe(rating: number) {
    if (!this.currentUser) {
      alert('Моля, влезте в системата за да оцените рецептата');
      return;
    }

    this.http.post(`/api/themes/${this.recipe._id}/rate`, { rating }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.recipe.averageRating = response.averageRating;
        this.recipe.totalRatings = response.totalRatings;
        this.userRating = rating;

        // Update user's rating in the ratings array
        const existingRatingIndex = this.recipe.ratings?.findIndex((r: any) => r.userId === this.currentUser._id);
        const newRating = { rating, userId: this.currentUser._id, username: this.currentUser.username };

        if (existingRatingIndex !== -1) {
          this.recipe.ratings[existingRatingIndex] = newRating;
        } else {
          if (!this.recipe.ratings) this.recipe.ratings = [];
          this.recipe.ratings.push(newRating);
        }
      },
      error: (err) => {
        console.error('Error rating recipe:', err);
        alert('Грешка при оценяване на рецептата');
      }
    });
  }

  likeRecipe(action: 'like' | 'dislike') {
    if (!this.currentUser) {
      alert('Моля, влезте в системата за да харесате рецептата');
      return;
    }

    if (!this.recipe) return;

    // Optimistically update UI
    if (action === 'like') {
      if (this.userLiked) {
        // Remove like
        this.recipe.likes = this.recipe.likes?.filter((id: string) => id !== this.currentUser._id) || [];
        this.userLiked = false;
      } else {
        // Add like and remove dislike
        if (!this.recipe.likes) this.recipe.likes = [];
        this.recipe.likes.push(this.currentUser._id);
        this.userLiked = true;

        if (this.userDisliked) {
          this.recipe.dislikes = this.recipe.dislikes?.filter((id: string) => id !== this.currentUser._id) || [];
          this.userDisliked = false;
        }
      }
    } else {
      if (this.userDisliked) {
        // Remove dislike
        this.recipe.dislikes = this.recipe.dislikes?.filter((id: string) => id !== this.currentUser._id) || [];
        this.userDisliked = false;
      } else {
        // Add dislike and remove like
        if (!this.recipe.dislikes) this.recipe.dislikes = [];
        this.recipe.dislikes.push(this.currentUser._id);
        this.userDisliked = true;

        if (this.userLiked) {
          this.recipe.likes = this.recipe.likes?.filter((id: string) => id !== this.currentUser._id) || [];
          this.userLiked = false;
        }
      }
    }

    // Send request to backend
    this.http.post(`/api/themes/${this.recipe._id}/like`, { action }, { withCredentials: true }).subscribe({
      next: () => {
        // Success - UI already updated
      },
      error: (err) => {
        console.error('Error liking/disliking recipe:', err);
        // Revert optimistic changes on error
        this.loadRecipe(); // Reload the recipe to revert optimistic changes
      }
    });
  }

  toggleFavorite() {
    if (!this.currentUser) {
      alert('Моля, влезте в системата за да добавите в любими');
      return;
    }

    if (!this.recipe) return;

    // Optimistically update UI
    if (this.isFavorite) {
      this.recipe.favorites = this.recipe.favorites?.filter((id: string) => id !== this.currentUser._id) || [];
      this.isFavorite = false;
    } else {
      if (!this.recipe.favorites) this.recipe.favorites = [];
      this.recipe.favorites.push(this.currentUser._id);
      this.isFavorite = true;
    }

    // Send request to backend
    this.http.post(`/api/themes/${this.recipe._id}/favorite`, {}, { withCredentials: true }).subscribe({
      next: () => {
        // Success - UI already updated
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
        // Revert optimistic changes on error
        this.loadRecipe(); // Reload the recipe to revert optimistic changes
      }
    });
  }

  addComment() {
    if (!this.currentUser) {
      alert('Моля, влезте в системата за да коментирате');
      return;
    }

    if (!this.newCommentText.trim()) {
      alert('Моля, въведете коментар');
      return;
    }

    this.http.post(`/api/ratings/${this.recipe._id}/comments`, { text: this.newCommentText }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.newCommentText = '';
        this.refreshComments(); // Refresh comments to get updated structure
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        alert('Грешка при добавяне на коментар');
      }
    });
  }

  addReply(commentId: string, replyText: string) {
    if (!this.currentUser) {
      alert('Моля, влезте в системата за да отговорите');
      return;
    }

    if (!replyText.trim()) {
      alert('Моля, въведете отговор');
      return;
    }

    this.http.post(`/api/ratings/${this.recipe._id}/comments/${commentId}/replies`, { text: replyText }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        // Hide reply form using recursive search
        const findComment = (comments: any[], targetId: string): any => {
          for (const comment of comments) {
            if (comment._id === targetId) {
              return comment;
            }
            if (comment.replies && comment.replies.length > 0) {
              const found = findComment(comment.replies, targetId);
              if (found) return found;
            }
          }
          return null;
        };

        const parentComment = findComment(this.recipe.comments, commentId);
        if (parentComment) {
          parentComment.showReplyForm = false;
          parentComment.replyText = '';
        }
        this.refreshComments(); // Refresh comments to get updated structure
      },
      error: (err) => {
        console.error('Error adding reply:', err);
        alert('Грешка при добавяне на отговор');
      }
    });
  }

  toggleReplyForm(commentId: string) {
    // Search for the comment in the entire hierarchy (comments and nested replies)
    const findComment = (comments: any[], targetId: string): any => {
      for (const comment of comments) {
        if (comment._id === targetId) {
          return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
          const found = findComment(comment.replies, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const comment = findComment(this.recipe.comments, commentId);
    if (comment) {
      comment.showReplyForm = !comment.showReplyForm;
      if (!comment.showReplyForm) {
        comment.replyText = '';
      }
    }
  }

  cancelReply(commentId: string) {
    // Search for the comment in the entire hierarchy (comments and nested replies)
    const findComment = (comments: any[], targetId: string): any => {
      for (const comment of comments) {
        if (comment._id === targetId) {
          return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
          const found = findComment(comment.replies, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const comment = findComment(this.recipe.comments, commentId);
    if (comment) {
      comment.showReplyForm = false;
      comment.replyText = '';
    }
  }

  likeComment(commentId: string) {
    if (!this.currentUser) {
      alert('Моля, влезте в системата за да харесате коментара');
      return;
    }

    this.http.post(`/api/ratings/${this.recipe._id}/comments/${commentId}/like`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.refreshComments(); // Refresh comments to get updated likes
      },
      error: (err) => {
        console.error('Error liking comment:', err);
        alert('Грешка при харесване на коментара');
      }
    });
  }

  dislikeComment(commentId: string) {
    if (!this.currentUser) {
      alert('Моля, влезте в системата за да не харесате коментара');
      return;
    }

    this.http.post(`/api/ratings/${this.recipe._id}/comments/${commentId}/dislike`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.refreshComments(); // Refresh comments to get updated dislikes
      },
      error: (err) => {
        console.error('Error disliking comment:', err);
        alert('Грешка при не харесване на коментара');
      }
    });
  }

  isCommentLiked(comment: any): boolean {
    return this.currentUser && comment.likes?.includes(this.currentUser._id);
  }

  isCommentDisliked(comment: any): boolean {
    return this.currentUser && comment.dislikes?.includes(this.currentUser._id);
  }

  getTopLevelComments(): any[] {
    console.log('getTopLevelComments called, recipe.comments:', this.recipe?.comments);
    if (!this.recipe?.comments) {
      console.log('No comments found, returning empty array');
      return [];
    }

    // Build hierarchical structure from flat comments array
    const topLevelComments = this.recipe.comments.filter((comment: any) => !comment.parentCommentId);

    // Organize replies for each top-level comment
    topLevelComments.forEach((comment: any) => {
      comment.replies = this.buildRepliesHierarchy(comment._id);
    });

    console.log('Built hierarchical structure:', topLevelComments);
    return topLevelComments;
  }

  buildRepliesHierarchy(parentId: string): any[] {
    const directReplies = this.recipe.comments.filter((comment: any) =>
      comment.parentCommentId === parentId
    );

    // Recursively build nested replies
    directReplies.forEach((reply: any) => {
      reply.replies = this.buildRepliesHierarchy(reply._id);
    });

    return directReplies;
  }



  refreshComments() {
    if (!this.recipe._id) return;

    this.http.get(`/api/ratings/${this.recipe._id}/comments`, { withCredentials: true }).subscribe({
      next: (commentsResponse: any) => {
        // Preserve UI state (showReplyForm and replyText) when refreshing
        const preserveUIState = (oldComments: any[], newComments: any[]) => {
          for (const newComment of newComments) {
            const oldComment = oldComments.find(c => c._id === newComment._id);
            if (oldComment) {
              newComment.showReplyForm = oldComment.showReplyForm || false;
              newComment.replyText = oldComment.replyText || '';
            }
            if (newComment.replies && newComment.replies.length > 0) {
              const oldReplies = oldComment?.replies || [];
              preserveUIState(oldReplies, newComment.replies);
            }
          }
        };

        const oldComments = this.recipe.comments || [];
        this.recipe.comments = commentsResponse.comments || [];
        preserveUIState(oldComments, this.recipe.comments);
      },
      error: (err) => {
        console.error('Error refreshing comments:', err);
      }
    });
  }

  deleteComment(commentId: string) {
    if (!this.currentUser) return;

    this.http.delete(`/api/ratings/${this.recipe._id}/comments/${commentId}`, { withCredentials: true }).subscribe({
      next: () => {
        // Refresh comments to get updated structure
        this.refreshComments();
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
        alert('Грешка при изтриване на коментар');
      }
    });
  }

  canDeleteComment(comment: any): boolean {
    return this.currentUser && (comment.userId === this.currentUser._id || this.currentUser.role === 'admin');
  }

  getInstructionSteps(): string[] {
    if (!this.recipe.text) return [];
    return this.recipe.text.split('\n').filter((step: string) => step.trim().length > 0);
  }

  getSafeVideoUrl(): SafeResourceUrl {
    if (!this.recipe.videoUrl) return '';

    if (this.recipe.videoType === 'youtube') {
      const videoId = this.extractYouTubeId(this.recipe.videoUrl);
      if (videoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
      }
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(this.recipe.videoUrl);
  }

  extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getStars(): string[] {
    const stars = [];
    const fullStars = Math.floor(this.recipe.averageRating || 0);
    const hasHalfStar = (this.recipe.averageRating || 0) % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('filled');
    }
    if (hasHalfStar) {
      stars.push('half');
    }
    while (stars.length < 5) {
      stars.push('empty');
    }
    return stars;
  }

  getRatingStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('bg-BG');
  }

  goBack() {
    this.router.navigate(['/themes']);
  }
}
