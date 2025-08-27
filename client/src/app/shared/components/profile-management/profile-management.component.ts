import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-profile-management',
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.scss']
})
export class ProfileManagementComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() profileUpdated = new EventEmitter<User>();
  @Output() passwordChanged = new EventEmitter<{ currentPassword: string, newPassword: string }>();
  @Output() avatarUploaded = new EventEmitter<File>();

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isEditing = false;
  isChangingPassword = false;
  isUploadingAvatar = false;
  isChangingPasswordLoading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private fb: FormBuilder) {
    this.initForms();
  }

  ngOnInit() {
    console.log('ProfileManagementComponent initialized with user:', this.user);
    console.log('User object details:', {
      username: this.user?.username,
      email: this.user?.email,
      role: this.user?.role,
      id: this.user?._id
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && changes['user'].currentValue) {
      console.log('User data changed:', changes['user'].currentValue);
    }
  }

  getAvatarUrl(): string {
    if (!this.user?.avatar) {
      return 'assets/profile.png'; // Default avatar
    }

    // If avatar is a full URL, return it as is
    if (this.user.avatar.startsWith('http')) {
      return this.user.avatar;
    }

    // If avatar is a relative path, construct the full URL
    return `http://localhost:3000${this.user.avatar}`;
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', [Validators.maxLength(500)]],
      phone: [''],
      preferences: this.fb.group({
        notifications: this.fb.group({
          email: [true],
          push: [true]
        }),
        privacy: this.fb.group({
          profilePublic: [true],
          showEmail: [false]
        })
      })
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(5)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.user) {
      this.profileForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        bio: this.user.bio || '',
        phone: this.user.phone || '',
        preferences: this.user.preferences || {
          notifications: { email: true, push: true },
          privacy: { profilePublic: true, showEmail: false }
        }
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.value;
      this.profileUpdated.emit(profileData as User);
      this.isEditing = false;
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
    if (this.passwordForm.valid && !this.isChangingPasswordLoading) {
      this.isChangingPasswordLoading = true;
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.passwordChanged.emit({ currentPassword, newPassword });
    }
  }

  onPasswordChangeComplete(success: boolean): void {
    this.isChangingPasswordLoading = false;
    if (success) {
      this.isChangingPassword = false;
      this.passwordForm.reset();
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
      this.avatarUploaded.emit(this.selectedFile);
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  cancelAvatarUpload(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  toggleAvatarUpload(): void {
    const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
