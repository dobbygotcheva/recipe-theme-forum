import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-recipe',
  template: `
    <div class="create-recipe-container">
      <div class="create-recipe-header">
        <button (click)="goBack()" class="back-btn">
          ← Назад
        </button>
        <h1>📝 Създайте нова рецепта</h1>
        <p>Споделете вашата вкусна рецепта с общността</p>
      </div>

      <form (ngSubmit)="createRecipe()" class="recipe-form" #recipeForm="ngForm">
        <!-- Basic Information -->
        <div class="form-section">
          <h2>📋 Основна информация</h2>
          
          <div class="form-group">
            <label for="title">🍽️ Заглавие на рецептата *</label>
            <input 
              type="text" 
              id="title" 
              name="title"
              [(ngModel)]="recipe.title" 
              required 
              placeholder="Например: Спагети Карбонара"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="category">🏷️ Категория *</label>
            <select 
              id="category" 
              name="category"
              [(ngModel)]="recipe.category" 
              required 
              class="form-select"
            >
              <option value="">Изберете категория</option>
              <option value="Основно ястие">Основно ястие</option>
              <option value="Супа">Супа</option>
              <option value="Салата">Салата</option>
              <option value="Паста">Паста</option>
              <option value="Пица">Пица</option>
              <option value="Десерт">Десерт</option>
              <option value="Закуска">Закуска</option>
              <option value="Напитка">Напитка</option>
              <option value="Друго">Друго</option>
            </select>
          </div>

          <div class="form-group">
            <label for="time">⏰ Време за приготвяне (минути) *</label>
            <input 
              type="number" 
              id="time" 
              name="time"
              [(ngModel)]="recipe.time" 
              required 
              min="1"
              placeholder="30"
              class="form-input"
            >
          </div>
        </div>

        <!-- Image Upload -->
        <div class="form-section">
          <h2>🖼️ Снимка на рецептата</h2>
          
          <div class="form-group">
            <label for="imageUrl">📷 URL на снимка</label>
            <input 
              type="url" 
              id="imageUrl" 
              name="imageUrl"
              [(ngModel)]="recipe.imageUrl" 
              placeholder="https://example.com/image.jpg"
              class="form-input"
            >
            <small class="form-help">Или качете файл по-долу</small>
          </div>

          <div class="form-group">
            <label for="imageFile">📁 Качи снимка</label>
            <input 
              type="file" 
              id="imageFile" 
              name="imageFile"
              (change)="onImageSelected($event)" 
              accept="image/*"
              class="form-file"
            >
          </div>

          <div *ngIf="imagePreview" class="image-preview">
            <img [src]="imagePreview" alt="Preview" class="preview-image">
            <button type="button" (click)="removeImage()" class="remove-image-btn">❌ Премахни</button>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="form-section">
          <h2>🛒 Съставки</h2>
          
          <div class="form-group">
            <label for="ingredients">📝 Списък със съставки *</label>
            <textarea 
              id="ingredients" 
              name="ingredients"
              [(ngModel)]="recipe.ingredients" 
              required 
              placeholder="Например:&#10;• 400g спагети&#10;• 4 яйца&#10;• 100g пармезан&#10;• 100g бекон&#10;• Сол и черен пипер"
              rows="6"
              class="form-textarea"
            ></textarea>
            <small class="form-help">Избройте всички необходими съставки</small>
          </div>
        </div>

        <!-- Instructions -->
        <div class="form-section">
          <h2>👩‍🍳 Начин на приготвяне</h2>
          
          <div class="form-group">
            <label for="text">📋 Стъпки за приготвяне *</label>
            <textarea 
              id="text" 
              name="text"
              [(ngModel)]="recipe.text" 
              required 
              placeholder="Например:&#10;1. Варете спагетите според инструкциите на опаковката&#10;2. Изпържете бекона до хрупкаво&#10;3. Разбийте яйцата в купа&#10;4. Смесете спагетите с яйцата и бекона&#10;5. Поръсете с пармезан и черен пипер"
              rows="8"
              class="form-textarea"
            ></textarea>
            <small class="form-help">Опишете стъпките за приготвяне подробно</small>
          </div>
        </div>

        <!-- Nutritional Information -->
        <div class="form-section">
          <h2>🥗 Хранителна информация (по желание)</h2>
          
          <div class="nutritional-grid">
            <div class="form-group">
              <label for="calories">🔥 Калории (kcal)</label>
              <input 
                type="number" 
                id="calories" 
                name="calories"
                [(ngModel)]="recipe.calories" 
                min="0"
                placeholder="250"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="protein">💪 Протеини (g)</label>
              <input 
                type="number" 
                id="protein" 
                name="protein"
                [(ngModel)]="recipe.protein" 
                min="0"
                step="0.1"
                placeholder="15.5"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="fats">🥑 Мазнини (g)</label>
              <input 
                type="number" 
                id="fats" 
                name="fats"
                [(ngModel)]="recipe.fats" 
                min="0"
                step="0.1"
                placeholder="8.2"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="carbs">🍞 Въглехидрати (g)</label>
              <input 
                type="number" 
                id="carbs" 
                name="carbs"
                [(ngModel)]="recipe.carbs" 
                min="0"
                step="0.1"
                placeholder="30.0"
                class="form-input"
              >
            </div>
          </div>
          
          <small class="form-help">Попълнете хранителната информация за вашата рецепта. Това ще помогне на други потребители да следват своите хранителни цели.</small>
        </div>

        <!-- Video -->
        <div class="form-section">
          <h2>📺 Видео (по желание)</h2>
          
          <div class="form-group">
            <label for="videoUrl">🎥 YouTube URL</label>
            <input 
              type="url" 
              id="videoUrl" 
              name="videoUrl"
              [(ngModel)]="recipe.videoUrl" 
              placeholder="https://www.youtube.com/watch?v=..."
              class="form-input"
            >
            <small class="form-help">Поставете линк към YouTube видео с рецептата</small>
          </div>
        </div>

        <!-- Submit Section -->
        <div class="submit-section">
          <div class="form-actions">
            <button type="button" (click)="goBack()" class="cancel-btn">
              ❌ Отказ
            </button>
            <button type="submit" class="submit-btn" [disabled]="loading || !recipeForm.valid">
              {{ loading ? 'Създаване...' : '✅ Създай рецепта' }}
            </button>
          </div>

          <div *ngIf="error" class="error-message">
            ❌ {{ error }}
          </div>

          <div *ngIf="success" class="success-message">
            ✅ {{ success }}
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-recipe-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .create-recipe-header {
      text-align: center;
      margin-bottom: 2rem;
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .create-recipe-header h1 {
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }

    .create-recipe-header p {
      color: #7f8c8d;
      margin: 0;
    }

    .back-btn {
      position: absolute;
      top: 2rem;
      left: 2rem;
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .back-btn:hover {
      background: #5a6268;
    }

    .recipe-form {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e9ecef;
    }

    .form-section:last-child {
      border-bottom: none;
    }

    .form-section h2 {
      color: #2c3e50;
      margin: 0 0 1.5rem 0;
      font-size: 1.3rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      font-family: inherit;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .nutritional-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .nutritional-grid .form-group {
      margin-bottom: 0;
    }

    .form-file {
      width: 100%;
      padding: 0.75rem;
      border: 2px dashed #e9ecef;
      border-radius: 10px;
      background: #f8f9fa;
      cursor: pointer;
      transition: border-color 0.3s ease;
    }

    .form-file:hover {
      border-color: #667eea;
    }

    .form-help {
      display: block;
      margin-top: 0.25rem;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .image-preview {
      margin-top: 1rem;
      text-align: center;
    }

    .preview-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .remove-image-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      margin-top: 0.5rem;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .remove-image-btn:hover {
      background: #c0392b;
    }

    .submit-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .cancel-btn, .submit-btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .cancel-btn {
      background: #6c757d;
      color: white;
    }

    .cancel-btn:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    .submit-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .error-message {
      background: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
      padding: 1rem;
      border-radius: 10px;
      margin-top: 1rem;
      text-align: center;
    }

    .success-message {
      background: rgba(39, 174, 96, 0.1);
      color: #27ae60;
      padding: 1rem;
      border-radius: 10px;
      margin-top: 1rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      .create-recipe-container {
        padding: 1rem;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .back-btn {
        position: static;
        margin-bottom: 1rem;
      }
    }
  `]
})
export class CreateRecipeComponent implements OnInit {
  recipe = {
    title: '',
    category: '',
    time: null,
    ingredients: '',
    text: '',
    imageUrl: '',
    videoUrl: '',
    // Nutritional information
    protein: null,
    fats: null,
    carbs: null,
    calories: null
  };

  imageFile: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  error = '';
  success = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.checkAuthentication();
  }

  checkAuthentication() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      this.router.navigate(['/']);
      return;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      this.recipe.imageUrl = ''; // Clear URL if file is selected

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imageFile = null;
    this.imagePreview = null;
  }

  createRecipe() {
    if (!this.recipe.title || !this.recipe.category || !this.recipe.time ||
      !this.recipe.ingredients || !this.recipe.text) {
      this.error = 'Моля, попълнете всички задължителни полета';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', this.recipe.title);
    formData.append('category', this.recipe.category);
    formData.append('time', this.recipe.time.toString());
    formData.append('ingredients', this.recipe.ingredients);
    formData.append('text', this.recipe.text);

    if (this.recipe.videoUrl) {
      formData.append('videoUrl', this.recipe.videoUrl);
    }

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    } else if (this.recipe.imageUrl) {
      formData.append('img', this.recipe.imageUrl);
    }

    this.http.post('/api/themes', formData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = 'Рецептата е създадена успешно! Ще бъде прегледана от администратор.';

        // Reset form
        this.recipe = {
          title: '',
          category: '',
          time: null,
          ingredients: '',
          text: '',
          imageUrl: '',
          videoUrl: '',
          // Nutritional information
          protein: null,
          fats: null,
          carbs: null,
          calories: null
        };
        this.imageFile = null;
        this.imagePreview = null;

        // Redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/themes']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Грешка при създаване на рецептата. Моля, опитайте отново.';
        console.error('Error creating recipe:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/themes']);
  }
}
