import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-new-theme',
  templateUrl: './new-theme.component.html',
  styleUrls: ['./new-theme.component.scss']
})
export class NewThemeComponent {
  selectedFile: File | null = null;
  selectedVideoFile: File | null = null;
  imagePreview: string | null = null;
  imageUrl: string = '';
  videoUrl: string = '';

  constructor(private apiService: ApiService, private router: Router, private userService: UserService) { }
  categories: string[] = ['Закуски и тестени', 'Салати', 'Супички', 'Основни с месо', 'Основни без месо', 'Десерти', 'Напитки'];

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imageUrl = ''; // Clear URL when file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onVideoFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedVideoFile = file;
      this.videoUrl = ''; // Clear YouTube URL when file is selected
    }
  }

  isValidYouTubeUrl(url: string): boolean {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? true : false;
  }

  createThemeHandler(form: NgForm): void {
    if (form.invalid) {
      console.log('Form is invalid, returning');
      return;
    }
    const userId = this.userService.user?._id;

    const { title, category, time, ingredients, text } = form.value;
    
    console.log('=== CREATE THEME DEBUG ===');
    console.log('Form value:', form.value);
    console.log('User ID:', userId);
    console.log('Extracted data:', { title, category, time, ingredients, text });
    
    // Create FormData for file uploads
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('time', time);
    formData.append('ingredients', ingredients);
    formData.append('text', text);
    
    // Add image
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
      console.log('Adding image file:', this.selectedFile.name);
    } else if (this.imageUrl) {
      formData.append('img', this.imageUrl);
      console.log('Adding image URL:', this.imageUrl);
    }
    
    // Add video
    if (this.selectedVideoFile) {
      formData.append('video', this.selectedVideoFile);
      console.log('Adding video file:', this.selectedVideoFile.name);
    } else if (this.videoUrl && this.isValidYouTubeUrl(this.videoUrl)) {
      formData.append('videoUrl', this.videoUrl);
      console.log('Adding video URL:', this.videoUrl);
    }

    console.log('FormData entries:');
    // Remove the problematic entries() call
    console.log('FormData object:', formData);

    this.apiService.createThemeWithFiles(formData).subscribe({
      next: (response) => {
        console.log('Theme created successfully:', response);
        this.router.navigate(['/themes']);
      },
      error: (error) => {
        console.error('Error creating theme:', error);
        alert('Error creating theme: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }
}
