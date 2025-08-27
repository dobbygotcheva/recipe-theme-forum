import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-news-page',
  template: `
    <div class="news-container">
      <div class="page-header">
        <h1 class="page-title">📰 Актуално</h1>
        <p class="page-subtitle">Последни новини и актуализации</p>
      </div>
      
      <div class="news-grid">
        <article class="news-article featured">
          <div class="article-header">
            <div class="article-date">15 август 2025</div>
            <div class="article-category">Обновление</div>
          </div>
          <h2 class="article-title">🎉 Добре дошли в новия Theme Forum!</h2>
          <p class="article-excerpt">
            Радваме се да обявим, че нашият форум за рецепти е напълно функционален! 
            Сега можете да споделяте, оценявате и търсите вкусни рецепти.
          </p>
          <div class="article-footer">
            <span class="read-time">📖 2 мин четене</span>
            <button (click)="readArticle('1')" class="read-more-btn">Прочети повече</button>
          </div>
        </article>

        <article class="news-article">
          <div class="article-header">
            <div class="article-date">14 август 2025</div>
            <div class="article-category">Съвети</div>
          </div>
          <h3 class="article-title">🍳 Как да споделите перфектната рецепта</h3>
          <p class="article-excerpt">
            Научете как да създадете рецепта, която ще бъде полезна и лесна за следване от други потребители.
          </p>
          <div class="article-footer">
            <span class="read-time">📖 3 мин четене</span>
            <button (click)="readArticle('2')" class="read-more-btn">Прочети повече</button>
          </div>
        </article>

        <article class="news-article">
          <div class="article-header">
            <div class="article-date">13 август 2025</div>
            <div class="article-category">Общност</div>
          </div>
          <h3 class="article-title">⭐ Системата за оценки вече работи</h3>
          <p class="article-excerpt">
            Сега можете да оценявате рецептите на други потребители и да помагате на общността да намира най-добрите рецепти.
          </p>
          <div class="article-footer">
            <span class="read-time">📖 1 мин четене</span>
            <button (click)="readArticle('3')" class="read-more-btn">Прочети повече</button>
          </div>
        </article>

        <article class="news-article">
          <div class="article-header">
            <div class="article-date">12 август 2025</div>
            <div class="article-category">Функции</div>
          </div>
          <h3 class="article-title">🔍 Подобрено търсене на рецепти</h3>
          <p class="article-excerpt">
            Новата функция за търсене ви позволява да намерите точно това, което търсите - по категория, време за готвене или съставки.
          </p>
          <div class="article-footer">
            <span class="read-time">📖 2 мин четене</span>
            <button (click)="readArticle('4')" class="read-more-btn">Прочети повече</button>
          </div>
        </article>
      </div>
      
      <div class="cta-section">
        <h3>Искате да споделите рецепта?</h3>
        <p>Присъединете се към нашата общност и споделете вашите любими рецепти</p>
        <a routerLink="/themes" class="cta-button">
          🍽️ Разгледайте рецептите
        </a>
      </div>
    </div>
  `,
  styles: [`
    .news-container {
      padding: 2rem 0;
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-title {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-weight: 300;
    }

    .page-subtitle {
      font-size: 1.2rem;
      color: #7f8c8d;
      margin-bottom: 0;
    }

    .news-grid {
      display: grid;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .news-article {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 1px solid #e9ecef;
    }

    .news-article:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .news-article.featured {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .article-date {
      font-size: 0.9rem;
      color: #7f8c8d;
      font-weight: 500;
    }

    .featured .article-date {
      color: rgba(255,255,255,0.8);
    }

    .article-category {
      background: #3498db;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .featured .article-category {
      background: rgba(255,255,255,0.2);
    }

    .article-title {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.3;
    }

    .featured .article-title {
      color: white;
      font-size: 1.8rem;
    }

    .article-excerpt {
      color: #7f8c8d;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .featured .article-excerpt {
      color: rgba(255,255,255,0.9);
    }

    .article-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }
    
    .read-more-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }
    
    .read-more-btn:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }
    
    .featured .read-more-btn {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
    }
    
    .featured .read-more-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .read-time {
      font-size: 0.9rem;
      color: #95a5a6;
    }

    .featured .read-time {
      color: rgba(255,255,255,0.7);
    }

    .cta-section {
      text-align: center;
      background: white;
      padding: 3rem 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .cta-section h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .cta-section p {
      color: #7f8c8d;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }

    @media (max-width: 768px) {
      .news-container {
        padding: 1rem 0;
      }
      
      .news-article {
        padding: 1.5rem;
      }
      
      .page-title {
        font-size: 2rem;
      }
      
      .featured .article-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class NewsPageComponent {
  constructor(private router: Router) { }

  readArticle(articleId: string) {
    this.router.navigate(['/article', articleId]);
  }
}