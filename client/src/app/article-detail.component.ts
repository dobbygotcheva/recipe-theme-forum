import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-article-detail',
    template: `
    <div class="article-detail-container">
      <div *ngIf="article" class="article-content">
        <!-- Header with back button -->
        <div class="article-header">
          <button (click)="goBack()" class="back-btn">
            ← Назад към новините
          </button>
          <div class="article-category">{{ article.category }}</div>
        </div>
        
        <!-- Article Hero -->
        <div class="article-hero">
          <div class="article-date">{{ article.date }}</div>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <span class="read-time">{{ article.readTime }}</span>
          </div>
        </div>
        
        <!-- Article Content -->
        <div class="article-body">
          <div class="article-text" [innerHTML]="article.content"></div>
        </div>
        
        <!-- Action Buttons -->
        <div class="action-buttons">
          <button (click)="goBack()" class="secondary-btn">
            ← Назад към новините
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .article-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .back-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .back-btn:hover {
      background: #5a67d8;
    }

    .article-category {
      background: #3498db;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
    }

    .article-hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      border-radius: 15px;
      text-align: center;
      margin-bottom: 2rem;
    }

    .article-date {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-bottom: 1rem;
    }

    .article-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.3;
    }

    .article-meta {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .read-time {
      opacity: 0.8;
    }

    .article-body {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .article-text {
      color: #2c3e50;
      line-height: 1.8;
      font-size: 1.1rem;
    }

    .article-text h2 {
      color: #2c3e50;
      margin: 2rem 0 1rem 0;
      font-weight: 600;
    }

    .article-text h3 {
      color: #2c3e50;
      margin: 1.5rem 0 1rem 0;
      font-weight: 600;
    }

    .article-text p {
      margin-bottom: 1.5rem;
    }

    .article-text ul, .article-text ol {
      margin-bottom: 1.5rem;
      padding-left: 2rem;
    }

    .article-text li {
      margin-bottom: 0.5rem;
    }

    .article-text blockquote {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 1rem 1.5rem;
      margin: 2rem 0;
      font-style: italic;
    }

    .action-buttons {
      text-align: center;
      margin-top: 2rem;
    }

    .secondary-btn {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .secondary-btn:hover {
      background: #7f8c8d;
    }

    @media (max-width: 768px) {
      .article-detail-container {
        padding: 1rem;
      }
      
      .article-title {
        font-size: 2rem;
      }
      
      .article-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
      
      .article-hero {
        padding: 2rem 1rem;
      }
    }
  `]
})
export class ArticleDetailComponent implements OnInit {
    article: any = null;

    private articles = [
        {
            id: '1',
            title: '🎉 Добре дошли в новия Theme Forum!',
            category: 'Обновление',
            date: '15 август 2025',
            readTime: '📖 2 мин четене',
            content: `
        <p>Радваме се да обявим, че нашият форум за рецепти е напълно функционален! Сега можете да споделяте, оценявате и търсите вкусни рецепти.</p>
        
        <h2>🌟 Какво ново има?</h2>
        
        <ul>
          <li><strong>Красив интерфейс</strong> - Нов модерен дизайн с градиентни цветове</li>
          <li><strong>Бързо зареждане</strong> - Оптимизирана производителност</li>
          <li><strong>Лесна навигация</strong> - Интуитивни бутони и менюта</li>
          <li><strong>Мобилна версия</strong> - Работи отлично на всички устройства</li>
        </ul>
        
        <h2>🍽️ Функционалности</h2>
        
        <p>Новият Theme Forum предлага:</p>
        
        <ul>
          <li>Преглед на рецепти с красиви карти</li>
          <li>Детайлен изглед на всяка рецепта</li>
          <li>Система за оценки и коментари</li>
          <li>Видео уроци (когато са налични)</li>
          <li>Категоризиране на рецептите</li>
        </ul>
        
        <blockquote>
          "Готвенето е изкуство, а споделянето на рецепти е начин да предадем това изкуство на другите."
        </blockquote>
        
        <h2>🚀 Как да започнете?</h2>
        
        <ol>
          <li>Разгледайте рецептите в секция "Рецепти"</li>
          <li>Кликнете върху рецепта, която ви харесва</li>
          <li>Следвайте стъпките за приготвяне</li>
          <li>Оценете рецептата след като я изпробвате</li>
        </ol>
        
        <p>Благодарим ви, че сте част от нашата общност на кулинарни ентусиасти!</p>
      `
        },
        {
            id: '2',
            title: '🍳 Как да споделите перфектната рецепта',
            category: 'Съвети',
            date: '14 август 2025',
            readTime: '📖 3 мин четене',
            content: `
        <p>Споделянето на рецепти е изкуство. Ето как да създадете рецепта, която ще бъде полезна и лесна за следване от други потребители.</p>
        
        <h2>📝 Структура на добрата рецепта</h2>
        
        <h3>1. Заглавие</h3>
        <p>Изберете ясно и привлекателно заглавие, което описва точно какво готвите.</p>
        
        <h3>2. Категория</h3>
        <p>Определете правилната категория - Предястие, Основно ястие, Десерт, Салата, и т.н.</p>
        
        <h3>3. Време за приготвяне</h3>
        <p>Бъдете реалистични с времето. Включете времето за подготовка и готвене.</p>
        
        <h3>4. Съставки</h3>
        <p>Изброете всички съставки в реда, в който ще ги използвате:</p>
        <ul>
          <li>Използвайте точни количества</li>
          <li>Уточнете размера (малка лъжичка, голяма чаша)</li>
          <li>Споменете алтернативи, ако има</li>
        </ul>
        
        <h3>5. Стъпки за приготвяне</h3>
        <p>Разделете процеса на ясни, последователни стъпки:</p>
        <ol>
          <li>Всяка стъпка трябва да е една конкретна задача</li>
          <li>Използвайте активни глаголи (нарежете, смесете, печете)</li>
          <li>Включете важни детайли (температура, време)</li>
          <li>Споменете визуални индикатори (златисто кафяво, мек)</li>
        </ol>
        
        <h2>💡 Полезни съвети</h2>
        
        <blockquote>
          Добрата рецепта е като добрия приятел - винаги е там, когато имате нужда, и никога не ви разочарова.
        </blockquote>
        
        <ul>
          <li><strong>Тествайте рецептата</strong> преди да я споделите</li>
          <li><strong>Добавете снимки</strong> - те правят рецептата по-привлекателна</li>
          <li><strong>Споделете съвети</strong> - какво се е случило при вас</li>
          <li><strong>Отговаряйте на въпроси</strong> - помагайте на други потребители</li>
        </ul>
        
        <h2>🎯 Заключение</h2>
        
        <p>Помнете, че всяка рецепта е възможност да споделите част от себе си. Готвенето е любов, а споделянето на рецепти е начин да разпространите тази любов.</p>
      `
        },
        {
            id: '3',
            title: '⭐ Системата за оценки вече работи',
            category: 'Общност',
            date: '13 август 2025',
            readTime: '📖 1 мин четене',
            content: `
        <p>Сега можете да оценявате рецептите на други потребители и да помагате на общността да намира най-добрите рецепти.</p>
        
        <h2>🌟 Как работи системата за оценки?</h2>
        
        <p>Всяка рецепта може да получи оценка от 1 до 5 звезди:</p>
        
        <ul>
          <li>⭐ - Не ми хареса</li>
          <li>⭐⭐ - Посредствена</li>
          <li>⭐⭐⭐ - Добра</li>
          <li>⭐⭐⭐⭐ - Много добра</li>
          <li>⭐⭐⭐⭐⭐ - Отлична</li>
        </ul>
        
        <h2>📊 Средна оценка</h2>
        
        <p>Всяка рецепта показва:</p>
        <ul>
          <li>Средната оценка от всички потребители</li>
          <li>Общия брой оценки</li>
          <li>Индивидуалните оценки от различни потребители</li>
        </ul>
        
        <blockquote>
          Вашата оценка помага на други да открият най-добрите рецепти!
        </blockquote>
        
        <p>Благодарим ви за участието в нашата общност!</p>
      `
        },
        {
            id: '4',
            title: '🔍 Подобрено търсене на рецепти',
            category: 'Функции',
            date: '12 август 2025',
            readTime: '📖 2 мин четене',
            content: `
        <p>Новата функция за търсене ви позволява да намерите точно това, което търсите - по категория, време за готвене или съставки.</p>
        
        <h2>🎯 Видове търсене</h2>
        
        <h3>По категория</h3>
        <p>Филтрирайте рецептите по тип:</p>
        <ul>
          <li>🍝 Паста</li>
          <li>🍕 Пица</li>
          <li>🥗 Салата</li>
          <li>🍽️ Основно ястие</li>
          <li>🍰 Десерт</li>
        </ul>
        
        <h3>По време за готвене</h3>
        <p>Намерете рецепти според наличното ви време:</p>
        <ul>
          <li>⚡ Бързи (до 15 мин)</li>
          <li>🕐 Умерени (15-45 мин)</li>
          <li>🕑 Дълги (над 45 мин)</li>
        </ul>
        
        <h3>По съставки</h3>
        <p>Търсете рецепти с конкретни съставки или избягвайте определени алергени.</p>
        
        <h2>💡 Съвети за търсене</h2>
        
        <blockquote>
          Доброто търсене започва с ясна идея какво искате да готвите.
        </blockquote>
        
        <ul>
          <li>Използвайте прости ключови думи</li>
          <li>Комбинирайте различни филтри</li>
          <li>Опитайте синоними, ако не намирате резултати</li>
        </ul>
        
        <p>Приятно готвене и успешно търсене!</p>
      `
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.article = this.articles.find(article => article.id === id);
        }
    }

    goBack() {
        this.router.navigate(['/news']);
    }
}
