import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-public-profile',
  template: `
    <div class="public-profile">
      <!-- Debug Info - Remove this later -->
      <div style="background: red; color: white; padding: 20px; margin: 20px; border-radius: 10px;">
        <h3>DEBUG INFO:</h3>
        <p>Component loaded: ✅</p>
        <p>User ID: {{ userId || 'Not set' }}</p>
        <p>User object: {{ user ? 'Loaded' : 'Not loaded' }}</p>
        <p>Loading: {{ loading }}</p>
        <p>User recipes count: {{ userRecipes.length }}</p>
      </div>

      <div *ngIf="user">
      <!-- Profile Header -->
      <header class="profile-header">
        <div class="header-content">
          <div class="profile-brand">
            <div class="profile-avatar-container">
              <img [src]="getAvatarUrl()" alt="Profile Avatar" class="header-avatar" />
            </div>
                         <div class="brand-info">
               <h1>{{ user.username }}'s Profile</h1>
               <p>Потребителски профил</p>
             </div>
           </div>
           <div class="profile-user">
             <span>Потребител: {{ user.username }}</span>
            <button (click)="goBack()" class="back-btn">← Назад</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <!-- Profile Info Section -->
        <div class="profile-section">
          <h2>📋 Информация за профила</h2>
          <div class="profile-card">
            <div class="profile-info">
                             <div class="info-row">
                 <span class="label">👤 Потребителско име:</span>
                 <span class="value">{{ user.username }}</span>
               </div>
               <div class="info-row" *ngIf="user?.preferences?.privacy?.showEmail">
                 <span class="label">📧 Email:</span>
                 <span class="value">{{ user.email }}</span>
               </div>
               <div class="info-row">
                 <span class="label">📅 Регистриран на:</span>
                 <span class="value">{{ formatDate(user.created_at) }}</span>
               </div>
               <div class="info-row">
                 <span class="label">🏷️ Роля:</span>
                 <span class="value role-badge" [class]="'role-' + user.role">
                   {{ getRoleText(user.role) }}
                 </span>
               </div>
               <div class="info-row" *ngIf="user?.bio">
                 <span class="label">📝 Биография:</span>
                 <span class="value">{{ user.bio }}</span>
               </div>
               <div class="info-row" *ngIf="user?.phone">
                 <span class="label">📱 Телефон:</span>
                 <span class="value">{{ user.phone }}</span>
               </div>
            </div>
          </div>
        </div>

        <!-- User's Recipes Section -->
                 <div class="recipes-section" *ngIf="userRecipes.length > 0">
           <h2>🍳 Рецепти на {{ user.username }}</h2>
          <div class="recipes-grid">
            <div class="recipe-card" *ngFor="let recipe of userRecipes">
              <div class="recipe-image">
                <img [src]="getRecipeImageUrl(recipe)" alt="Recipe Image" />
              </div>
              <div class="recipe-info">
                <h3>{{ recipe.title }}</h3>
                                 <p>{{ (recipe.description || '').substring(0, 100) }}{{ (recipe.description || '').length > 100 ? '...' : '' }}</p>
                <div class="recipe-meta">
                  <span class="likes">👍 {{ recipe.likes?.length || 0 }}</span>
                  <span class="favorites">❤️ {{ recipe.favorites?.length || 0 }}</span>
                </div>
                <button (click)="viewRecipe(recipe._id)" class="view-recipe-btn">
                  Преглед на рецепта
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Recipes Message -->
        <div class="no-recipes" *ngIf="userRecipes.length === 0 && !loading">
          <h3>🍳 Няма публикувани рецепти</h3>
                     <p>{{ user.username }} все още не е публикувал рецепти.</p>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="loading">
          <div class="loading-spinner"></div>
          <p>Зареждане на профила...</p>
        </div>
      </main>
      </div>

      <!-- Fallback when no user -->
      <div *ngIf="!user && !loading" style="text-align: center; padding: 50px; color: white;">
        <h2>❌ User Not Found</h2>
        <p>Could not load user profile for ID: {{ userId }}</p>
        <p>This might be because:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>The user ID is invalid</li>
          <li>The user doesn't exist</li>
          <li>There's an API error</li>
        </ul>
        <button (click)="goBack()" style="margin-top: 20px; padding: 10px 20px; background: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer;">
          ← Go Back
        </button>
      </div>
    </div>
  `,
  styles: [`
    .public-profile {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .profile-header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;

        .profile-brand {
          display: flex;
          align-items: center;
          gap: 1.5rem;

          .profile-avatar-container {
            .header-avatar {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              object-fit: cover;
              border: 4px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
          }

          .brand-info {
            h1 {
              color: white;
              margin: 0;
              font-size: 2.5rem;
              font-weight: 700;
              text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }

            p {
              color: rgba(255, 255, 255, 0.9);
              margin: 0.5rem 0 0 0;
              font-size: 1.1rem;
            }
          }
        }

        .profile-user {
          display: flex;
          align-items: center;
          gap: 1rem;

          span {
            color: white;
            font-size: 1.1rem;
            font-weight: 500;
          }

          .back-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
          }
        }
      }
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-section, .recipes-section {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);

      h2 {
        color: #333;
        margin: 0 0 1.5rem 0;
        font-size: 1.8rem;
        font-weight: 600;
      }
    }

    .profile-card {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 1.5rem;

      .profile-info {
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e9ecef;

          &:last-child {
            border-bottom: none;
          }

          .label {
            font-weight: 600;
            color: #495057;
            min-width: 200px;
          }

          .value {
            color: #333;
            text-align: right;
            flex: 1;
          }

          .role-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.9rem;
            font-weight: 500;
            text-align: center;
            min-width: 80px;

            &.role-admin {
              background: rgba(220, 53, 69, 0.2);
              color: #dc3545;
              border: 1px solid #dc3545;
            }

            &.role-user {
              background: rgba(40, 167, 69, 0.2);
              color: #28a745;
              border: 1px solid #28a745;
            }
          }
        }
      }
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .recipe-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      .recipe-image {
        height: 200px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .recipe-info {
        padding: 1.5rem;

        h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.3rem;
        }

        p {
          color: #666;
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .recipe-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;

          span {
            color: #666;
            font-size: 0.9rem;
          }
        }

        .view-recipe-btn {
          width: 100%;
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease;

          &:hover {
            background: #5a6fd8;
          }
        }
      }
    }

    .no-recipes {
      text-align: center;
      padding: 3rem;
      color: #666;

      h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      p {
        margin: 0;
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .public-profile {
        padding: 1rem;
      }

      .profile-header .header-content {
        flex-direction: column;
        text-align: center;

        .profile-brand {
          flex-direction: column;
          text-align: center;
        }
      }

      .recipes-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PublicProfileComponent implements OnInit {
  @Input() userId?: string;
  user: User | null = null;
  userRecipes: any[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('PublicProfileComponent initialized');
    console.log('Input userId:', this.userId);

    // Get userId from route params if not provided as input
    if (!this.userId) {
      console.log('Getting userId from route params...');
      this.route.params.subscribe(params => {
        console.log('Route params:', params);
        this.userId = params['id'];
        console.log('Extracted userId:', this.userId);
        if (this.userId) {
          this.loadUserProfile();
          this.loadUserRecipes();
        } else {
          console.error('No userId found in route params');
        }
      });
    } else {
      console.log('Using provided userId:', this.userId);
      this.loadUserProfile();
      this.loadUserRecipes();
    }
  }

  ngAfterViewInit() {
    console.log('PublicProfileComponent view initialized');
    console.log('Current user object:', this.user);
    console.log('Current userRecipes:', this.userRecipes);
    console.log('Current loading state:', this.loading);
  }

  loadUserProfile() {
    if (!this.userId) {
      console.error('No userId provided');
      return;
    }

    console.log('Loading user profile for userId:', this.userId);

    // For testing purposes, create mock data
    if (this.userId === '1' || this.userId === 'demo-user-1') {
      console.log('Using mock data for testing');
      this.user = {
        _id: this.userId,
        username: 'Demo User',
        email: 'demo@example.com',
        password: 'demo-password',
        bio: 'This is a demo user for testing the public profile feature.',
        phone: '+359 888 123 456',
        role: 'user',
        themes: [],
        posts: [],
        created_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _v: 0,
        preferences: {
          notifications: {
            email: true,
            push: true
          },
          privacy: {
            profilePublic: true,
            showEmail: true
          }
        }
      };
      this.loading = false;
      return;
    }

    // Try real API call (this will fail for now since endpoint doesn't exist)
    this.http.get(`/api/users/${this.userId}`, { withCredentials: true }).subscribe({
      next: (user: any) => {
        console.log('Successfully loaded user profile:', user);
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        this.loading = false;
        // Handle error - user not found, etc.
        if (error.status === 404) {
          console.log('User not found - this is expected for demo user IDs');
        }
      }
    });
  }

  loadUserRecipes() {
    if (!this.userId) return;

    // For testing purposes, create mock recipes
    if (this.userId === '1' || this.userId === 'demo-user-1') {
      console.log('Using mock recipes for testing');
      this.userRecipes = [
        {
          _id: 'recipe1',
          title: 'Демо рецепта 1',
          description: 'Това е демо рецепта за тестване на публичния профил. Включва всички необходими компоненти за показване.',
          image: 'assets/logo.jpg',
          likes: ['user1', 'user2'],
          favorites: ['user1']
        },
        {
          _id: 'recipe2',
          title: 'Демо рецепта 2',
          description: 'Втора демо рецепта за показване на функционалността на профила.',
          image: 'assets/logo.jpg',
          likes: ['user1'],
          favorites: []
        }
      ];
      return;
    }

    // Try real API call (this will fail for now since endpoint doesn't exist)
    this.http.get(`/api/themes/user/${this.userId}`, { withCredentials: true }).subscribe({
      next: (recipes: any) => {
        this.userRecipes = recipes;
        console.log('Loaded user recipes:', recipes);
      },
      error: (error) => {
        console.error('Error loading user recipes:', error);
        this.userRecipes = [];
      }
    });
  }

  getAvatarUrl(): string {
    if (!this.user?.avatar) {
      return 'assets/profile.png';
    }
    if (this.user.avatar.startsWith('http')) {
      return this.user.avatar;
    }
    return `http://localhost:3000${this.user.avatar}`;
  }

  getRecipeImageUrl(recipe: any): string {
    if (!recipe.image) {
      return 'assets/default-recipe.jpg';
    }
    if (recipe.image.startsWith('http')) {
      return recipe.image;
    }
    return `http://localhost:3000${recipe.image}`;
  }

  formatDate(timestamp: string | undefined): string {
    if (!timestamp) return 'Не е известно';
    return new Date(timestamp).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRoleText(role: string | undefined): string {
    if (!role) return 'Не е известно';
    switch (role) {
      case 'admin': return 'Администратор';
      case 'user': return 'Потребител';
      default: return role;
    }
  }

  goBack() {
    this.router.navigate(['/themes']);
  }

  viewRecipe(recipeId: string) {
    this.router.navigate(['/theme', recipeId]);
  }
}
