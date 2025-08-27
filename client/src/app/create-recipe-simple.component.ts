import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-recipe-simple',
  template: `
    <div class="create-recipe-container">
      <div class="create-recipe-header">
        <button (click)="goBack()" class="back-btn">
          ← Назад
        </button>
        <h1>📝 Създайте нова рецепта</h1>
        <p>Споделете вашата вкусна рецепта с общността</p>
      </div>

      <div class="recipe-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h2>📋 Основна информация</h2>
          
          <div class="form-group">
            <label for="title">🍽️ Заглавие на рецептата *</label>
            <input 
              type="text" 
              id="title" 
              #titleInput
              placeholder="Например: Спагети Карбонара"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="category">🏷️ Категория *</label>
            <select 
              id="category" 
              #categorySelect
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
              #timeInput
              min="1"
              placeholder="30"
              class="form-input"
            >
          </div>
        </div>

        <!-- Ingredients -->
        <div class="form-section">
          <h2>🛒 Съставки</h2>
          
          <div class="form-group">
            <label for="ingredients">📝 Списък със съставки *</label>
            <textarea 
              id="ingredients" 
              #ingredientsInput
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
              #textInput
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
                #caloriesInput
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
                #proteinInput
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
                #fatsInput
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
                #carbsInput
                min="0"
                step="0.1"
                placeholder="30.0"
                class="form-input"
              >
            </div>
          </div>
          
          <small class="form-help">Попълнете хранителната информация за вашата рецепта. Това ще помогне на други потребители да следват своите хранителни цели.</small>
        </div>

        <!-- Photo Upload -->
        <div class="form-section">
          <h2>📸 Снимка на рецептата</h2>
          
          <div class="form-group">
            <label for="imageFile">🖼️ Качи снимка</label>
            <input 
              type="file" 
              id="imageFile" 
              accept="image/*"
              (change)="onImageSelected($event)"
              class="form-input"
            >
            <small class="form-help">Поддържани формати: JPG, PNG, GIF (макс. 5MB)</small>
          </div>

          <!-- Image Preview -->
          <div *ngIf="imagePreview" class="image-preview-section">
            <h3>👀 Предварителен преглед</h3>
            <div class="image-preview">
              <img [src]="imagePreview" alt="Предварителен преглед" class="preview-image">
              <button type="button" (click)="removeImage()" class="remove-image-btn">❌ Премахни</button>
            </div>
          </div>

          <!-- Alternative: Image URL -->
          <div class="form-group">
            <label for="imageUrl">🔗 Или поставете URL на снимка</label>
            <input 
              type="url" 
              id="imageUrl" 
              #imageUrlInput
              placeholder="https://example.com/recipe-image.jpg"
              class="form-input"
            >
            <small class="form-help">Алтернативно, можете да поставите линк към снимка</small>
          </div>
        </div>

        <!-- Video -->
        <div class="form-section">
          <h2>📺 Видео (по желание)</h2>
          
          <div class="form-group">
            <label for="videoUrl">🎥 YouTube URL</label>
            <input 
              type="url" 
              id="videoUrl" 
              #videoUrlInput
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
            <button type="button" (click)="createRecipe()" class="submit-btn" [disabled]="loading">
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
      </div>
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

    .image-preview-section {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 10px;
      border: 2px dashed #dee2e6;
    }

    .image-preview-section h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .image-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .preview-image {
      max-width: 200px;
      max-height: 150px;
      border-radius: 10px;
      border: 2px solid #e9ecef;
    }

    .remove-image-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .remove-image-btn:hover {
      background: #c0392b;
    }

    .form-help {
      display: block;
      margin-top: 0.25rem;
      color: #7f8c8d;
      font-size: 0.9rem;
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

    .nutritional-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
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
export class CreateRecipeSimpleComponent implements OnInit {
  loading = false;
  error = '';
  success = '';
  imageFile: File | null = null;
  imagePreview: string | null = null;

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
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Файлът е твърде голям. Максималният размер е 5MB.';
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        this.error = 'Моля, изберете валиден файл за снимка.';
        return;
      }

      this.imageFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      this.error = '';
    }
  }

  removeImage() {
    this.imageFile = null;
    this.imagePreview = null;
  }

  createRecipe() {
    // Get form values using template reference variables
    const title = (document.getElementById('title') as HTMLInputElement)?.value;
    const category = (document.getElementById('category') as HTMLSelectElement)?.value;
    const time = (document.getElementById('time') as HTMLInputElement)?.value;
    const ingredients = (document.getElementById('ingredients') as HTMLTextAreaElement)?.value;
    const text = (document.getElementById('text') as HTMLTextAreaElement)?.value;
    const videoUrl = (document.getElementById('videoUrl') as HTMLInputElement)?.value;
    const imageUrl = (document.getElementById('imageUrl') as HTMLInputElement)?.value;
    const calories = (document.getElementById('calories') as HTMLInputElement)?.value;
    const protein = (document.getElementById('protein') as HTMLInputElement)?.value;
    const fats = (document.getElementById('fats') as HTMLInputElement)?.value;
    const carbs = (document.getElementById('carbs') as HTMLInputElement)?.value;

    if (!title || !category || !time || !ingredients || !text) {
      this.error = 'Моля, попълнете всички задължителни полета';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Handle image upload or URL
    if (this.imageFile) {
      // Upload image file
      this.uploadImageAndCreateRecipe();
    } else {
      // Use image URL or create recipe without image
      const recipeData = {
        title,
        category,
        time: parseInt(time),
        ingredients,
        text,
        videoUrl: videoUrl || undefined,
        img: imageUrl || '',
        calories: parseInt(calories) || 0,
        protein: parseFloat(protein) || 0,
        fats: parseFloat(fats) || 0,
        carbs: parseFloat(carbs) || 0
      };

      this.createRecipeWithData(recipeData);
    }
  }

  uploadImageAndCreateRecipe() {
    const title = (document.getElementById('title') as HTMLInputElement)?.value;
    const category = (document.getElementById('category') as HTMLSelectElement)?.value;
    const time = (document.getElementById('time') as HTMLInputElement)?.value;
    const ingredients = (document.getElementById('ingredients') as HTMLTextAreaElement)?.value;
    const text = (document.getElementById('text') as HTMLTextAreaElement)?.value;
    const videoUrl = (document.getElementById('videoUrl') as HTMLInputElement)?.value;
    const calories = (document.getElementById('calories') as HTMLInputElement)?.value;
    const protein = (document.getElementById('protein') as HTMLInputElement)?.value;
    const fats = (document.getElementById('fats') as HTMLInputElement)?.value;
    const carbs = (document.getElementById('carbs') as HTMLInputElement)?.value;

    const formData = new FormData();
    formData.append('image', this.imageFile!);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('time', time);
    formData.append('ingredients', ingredients);
    formData.append('text', text);
    if (videoUrl) formData.append('videoUrl', videoUrl);
    if (calories) formData.append('calories', calories);
    if (protein) formData.append('protein', protein);
    if (fats) formData.append('fats', fats);
    if (carbs) formData.append('carbs', carbs);

    this.http.post('/api/themes/upload', formData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = 'Рецептата с изображение е създадена успешно!';
        this.clearForm();
        setTimeout(() => {
          this.router.navigate(['/themes']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Грешка при качване на изображението. Моля, опитайте отново.';
        console.error('Error uploading image:', err);
      }
    });
  }

  createRecipeWithData(recipeData: any) {

    this.http.post('/api/themes', recipeData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = 'Рецептата е създадена успешно! Ще бъде прегледана от администратор.';

        this.clearForm();

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

  clearForm() {
    (document.getElementById('title') as HTMLInputElement).value = '';
    (document.getElementById('category') as HTMLSelectElement).value = '';
    (document.getElementById('time') as HTMLInputElement).value = '';
    (document.getElementById('ingredients') as HTMLTextAreaElement).value = '';
    (document.getElementById('text') as HTMLTextAreaElement).value = '';
    (document.getElementById('videoUrl') as HTMLInputElement).value = '';
    (document.getElementById('imageUrl') as HTMLInputElement).value = '';
    (document.getElementById('calories') as HTMLInputElement).value = '';
    (document.getElementById('protein') as HTMLInputElement).value = '';
    (document.getElementById('fats') as HTMLInputElement).value = '';
    (document.getElementById('carbs') as HTMLInputElement).value = '';
    this.imageFile = null;
    this.imagePreview = null;
  }
}
