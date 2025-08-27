import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { UserService } from '../user.service';
import { Theme } from 'src/app/shared/interfaces/theme';
import { User, UserPreferences } from 'src/app/shared/interfaces/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FavoritesService } from 'src/app/shared/services/favorites.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  constructor(
    private userService: UserService, 
    private router: Router, 
    activateRoute: ActivatedRoute, 
    private apiService: ApiService,
    private fb: FormBuilder,
    private favoritesService: FavoritesService
  ) {}

  themes: Theme[] = [];
  favorites: Theme[] = [];
  isEditing = false;
  isChangingPassword = false;
  isUploadingAvatar = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Profile form
  profileForm!: FormGroup;
  
  // Password change form
  passwordForm!: FormGroup;

  get username(): string {
    return this.userService.user?.username || '';
  }
  
  get email(): string {
    return this.userService.user?.email || '';
  }

  get bio(): string {
    return this.userService.user?.bio || '';
  }

  get phone(): string {
    return this.userService.user?.phone || '';
  }

  get avatar(): string {
    const avatarUrl = this.userService.user?.avatar || '';
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      return `http://localhost:3000${avatarUrl}`;
    }
    return avatarUrl || '';
  }

  get preferences(): UserPreferences | undefined {
    return this.userService.user?.preferences;
  }
 
  get isLogged(): boolean {
    return this.userService.isLogged;
  }

  ngOnInit(): void {
    this.initForms();
    this.loadUserThemes();
    this.loadUserFavorites();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      username: [this.username, [Validators.required, Validators.minLength(2)]],
      email: [this.email, [Validators.required, Validators.email]],
      bio: [this.bio, [Validators.maxLength(500)]],
      phone: [this.phone],
      preferences: this.fb.group({
        notifications: this.fb.group({
          email: [this.preferences?.notifications.email ?? true],
          push: [this.preferences?.notifications.push ?? true]
        }),
        privacy: this.fb.group({
          profilePublic: [this.preferences?.privacy.profilePublic ?? true],
          showEmail: [this.preferences?.privacy.showEmail ?? false]
        })
      })
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(5)]],
      newPassword: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadUserThemes(): void {
    this.apiService.getThemes().subscribe({
      next: (themes: Theme[]) => {
        // Filter themes to only show user's own themes
        this.themes = themes.filter(theme => theme.userId === this.userService.user?._id);
      },
      error: (err: any) => {
        console.error('Error loading user themes:', err);
      }
    });
  }

  private loadUserFavorites(): void {
    this.favoritesService.getUserFavorites().subscribe({
      next: (favorites: Theme[]) => {
        this.favorites = favorites;
      },
      error: (err: any) => {
        console.error('Error loading user favorites:', err);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.patchValue({
        username: this.username,
        email: this.email,
        bio: this.bio,
        phone: this.phone,
        preferences: this.preferences
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.value;
      this.userService.updateProfileAdvanced(profileData).subscribe({
        next: (user) => {
          console.log('Profile updated successfully:', user);
          this.isEditing = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          alert('Error updating profile. Please try again.');
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.profileForm.reset();
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.userService.changePassword(currentPassword, newPassword).subscribe({
        next: (response) => {
          console.log('Password changed successfully:', response);
          this.isChangingPassword = false;
          this.passwordForm.reset();
          alert('Password changed successfully!');
        },
        error: (error) => {
          console.error('Error changing password:', error);
          alert('Error changing password. Please check your current password.');
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar(): void {
    if (this.selectedFile) {
      this.isUploadingAvatar = true;
      this.userService.uploadAvatar(this.selectedFile).subscribe({
        next: (response) => {
          console.log('Avatar uploaded successfully:', response);
          this.isUploadingAvatar = false;
          this.selectedFile = null;
          this.previewUrl = null;
          alert('Avatar uploaded successfully!');
        },
        error: (error) => {
          console.error('Error uploading avatar:', error);
          this.isUploadingAvatar = false;
          alert('Error uploading avatar. Please try again.');
        }
      });
    }
  }

  cancelAvatarUpload(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  toggleAvatarUpload(): void {
    // This method is called when the avatar upload button is clicked
    // It triggers the file input
    const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
