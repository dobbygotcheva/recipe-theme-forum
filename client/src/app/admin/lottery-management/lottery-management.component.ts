import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LotteryService, Lottery } from '../../shared/services/lottery.service';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-lottery-management',
  templateUrl: './lottery-management.component.html',
  styleUrls: ['./lottery-management.component.scss']
})
export class LotteryManagementComponent implements OnInit {
  lottery: Lottery | null = null;
  loading = false;
  error = '';
  success = '';
  editForm: FormGroup;
  isEditing = false;

  constructor(
    private lotteryService: LotteryService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      prize: ['', Validators.required],
      endDate: ['', Validators.required],
      maxParticipants: [100, [Validators.required, Validators.min(1), Validators.max(1000)]]
    });
  }

  ngOnInit(): void {
    this.loadLottery();
  }

  loadLottery(): void {
    this.loading = true;
    this.error = '';
    
    this.lotteryService.getLottery().subscribe({
      next: (response) => {
        this.lottery = response.data;
        this.populateForm();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Грешка при зареждане на томболата';
        this.loading = false;
        console.error('Error loading lottery:', error);
      }
    });
  }

  populateForm(): void {
    if (this.lottery) {
      this.editForm.patchValue({
        name: this.lottery.name,
        description: this.lottery.description,
        prize: this.lottery.prize,
        endDate: new Date(this.lottery.endDate).toISOString().slice(0, 16),
        maxParticipants: this.lottery.maxParticipants
      });
    }
  }

  startEditing(): void {
    this.isEditing = true;
    this.populateForm();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.populateForm();
  }

  saveChanges(): void {
    if (this.editForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const updates = this.editForm.value;
      updates.endDate = new Date(updates.endDate);

      this.lotteryService.updateLottery(updates).subscribe({
        next: (response) => {
          this.success = response.message || 'Томболата е обновена успешно!';
          this.lottery = response.data;
          this.isEditing = false;
          this.loading = false;
          
          setTimeout(() => {
            this.success = '';
          }, 5000);
        },
        error: (error) => {
          this.error = error.error?.message || 'Грешка при обновяване на томболата';
          this.loading = false;
        }
      });
    }
  }

  drawWinner(): void {
    if (confirm('Сигурни ли сте, че искате да изберете победител? Това действие не може да бъде отменено.')) {
      this.loading = true;
      this.error = '';
      this.success = '';

      this.lotteryService.drawWinner().subscribe({
        next: (response) => {
          this.success = response.message || 'Победителят е избран успешно!';
          this.lottery = response.data;
          this.loading = false;
          
          setTimeout(() => {
            this.success = '';
          }, 5000);
        },
        error: (error) => {
          this.error = error.error?.message || 'Грешка при избиране на победител';
          this.loading = false;
        }
      });
    }
  }

  resetLottery(): void {
    if (confirm('Сигурни ли сте, че искате да рестартирате томболата? Всички участници и победител ще бъдат изтрити.')) {
      this.loading = true;
      this.error = '';
      this.success = '';

      this.lotteryService.resetLottery().subscribe({
        next: (response) => {
          this.success = response.message || 'Томболата е рестартирана успешно!';
          this.lottery = response.data;
          this.loading = false;
          
          setTimeout(() => {
            this.success = '';
          }, 5000);
        },
        error: (error) => {
          this.error = error.error?.message || 'Грешка при рестартиране на томболата';
          this.loading = false;
        }
      });
    }
  }

  canDrawWinner(): boolean {
    return !!(this.lottery?.isActive && 
           new Date() > new Date(this.lottery.endDate) &&
           this.lottery.participants.length > 0 &&
           !this.lottery.winner);
  }

  canReset(): boolean {
    return !!(this.lottery?.winner || !this.lottery?.isActive);
  }

  getTimeRemaining(): string {
    if (!this.lottery) return '';
    
    const now = new Date().getTime();
    const end = new Date(this.lottery.endDate).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) {
      return 'Томболата е приключила';
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} дни, ${hours} часа, ${minutes} минути`;
    } else if (hours > 0) {
      return `${hours} часа, ${minutes} минути`;
    } else {
      return `${minutes} минути`;
    }
  }
}
