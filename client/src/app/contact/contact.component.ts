import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      topic: ['general', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if user is logged in to pre-fill some fields
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.contactForm.patchValue({
        name: user.username || '',
        email: user.email || ''
      });
    }
  }

  onSubmit() {
    console.log('🔍 SUBMITTING CONTACT FORM!');
    console.log('🔍 Form data:', this.contactForm.value);

    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';

      const contactData = {
        ...this.contactForm.value,
        submittedAt: new Date().toISOString(),
        userId: this.getCurrentUserId()
      };

      console.log('🔍 Sending to server:', contactData);

      this.http.post('/api/contact', contactData).subscribe({
        next: (response: any) => {
          console.log('✅ MESSAGE SENT SUCCESSFULLY!');
          console.log('✅ Server response:', response);
          this.submitSuccess = true;
          this.contactForm.reset();
          this.contactForm.patchValue({ topic: 'general' });
          this.isSubmitting = false;

          // Reset success message after 5 seconds
          setTimeout(() => {
            this.submitSuccess = false;
          }, 5000);
        },
        error: (error: any) => {
          console.error('❌ MESSAGE SENDING FAILED!');
          console.error('❌ Error details:', error);
          this.submitError = 'Грешка при изпращане на съобщението. Моля, опитайте отново.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private getCurrentUserId(): string | null {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      return user._id || null;
    }
    return null;
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return 'Това поле е задължително.';
      }
      if (field.errors['email']) {
        return 'Моля, въведете валиден имейл адрес.';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Минималната дължина е ${requiredLength} символа.`;
      }
    }
    return '';
  }

  resetForm() {
    this.contactForm.reset();
    this.contactForm.patchValue({ topic: 'general' });
    this.submitSuccess = false;
    this.submitError = '';
  }

  goToHistory(): void {
    this.router.navigate(['/contact/history']);
  }
}
