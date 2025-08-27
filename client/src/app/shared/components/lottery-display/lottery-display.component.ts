import { Component, OnInit, OnDestroy } from '@angular/core';
import { LotteryService, Lottery } from '../../services/lottery.service';
import { UserService } from '../../../user/user.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-lottery-display',
  templateUrl: './lottery-display.component.html',
  styleUrls: ['./lottery-display.component.scss']
})
export class LotteryDisplayComponent implements OnInit, OnDestroy {
  lottery: Lottery | null = null;
  loading = false;
  error = '';
  success = '';
  timeRemaining = '';
  private timerSubscription: Subscription | null = null;

  constructor(
    private lotteryService: LotteryService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadLottery();
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadLottery(): void {
    this.loading = true;
    this.error = '';
    
    this.lotteryService.getLottery().subscribe({
      next: (response) => {
        this.lottery = response.data;
        this.updateTimeRemaining();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Грешка при зареждане на томболата';
        this.loading = false;
        console.error('Error loading lottery:', error);
      }
    });
  }

  joinLottery(): void {
    if (!this.userService.isLogged) {
      this.error = 'Трябва да сте влезли в профила си за да участвате';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.lotteryService.joinLottery().subscribe({
      next: (response) => {
        this.success = response.message || 'Успешно се присъединихте към томболата!';
        this.lottery = response.data;
        this.loading = false;
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.success = '';
        }, 5000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Грешка при присъединяване към томболата';
        this.loading = false;
      }
    });
  }

  startTimer(): void {
    this.timerSubscription = interval(60000).subscribe(() => {
      this.updateTimeRemaining();
    });
  }

  updateTimeRemaining(): void {
    if (this.lottery) {
      const timeRemaining = this.lotteryService.getTimeRemaining(this.lottery.endDate);
      this.timeRemaining = this.lotteryService.formatTimeRemaining(timeRemaining);
    }
  }

  isUserParticipating(): boolean {
    if (!this.lottery || !this.userService.user) {
      return false;
    }
    return this.lotteryService.isUserParticipating(this.lottery, this.userService.user._id);
  }

  canJoin(): boolean {
    return !!(this.lottery?.isActive && 
           !this.isUserParticipating() && 
           this.lottery.participants.length < this.lottery.maxParticipants);
  }

  getStatusText(): string {
    if (!this.lottery) return '';

    if (this.lottery.winner) {
      return 'Томболата е приключила!';
    }

    if (!this.lottery.isActive) {
      return 'Томболата не е активна';
    }

    if (this.lottery.participants.length >= this.lottery.maxParticipants) {
      return 'Томболата е пълна';
    }

    if (this.isUserParticipating()) {
      return 'Вече участвате в томболата!';
    }

    return 'Можете да участвате!';
  }

  getStatusClass(): string {
    if (!this.lottery) return '';

    if (this.lottery.winner) {
      return 'status-finished';
    }

    if (!this.lottery.isActive) {
      return 'status-inactive';
    }

    if (this.lottery.participants.length >= this.lottery.maxParticipants) {
      return 'status-full';
    }

    if (this.isUserParticipating()) {
      return 'status-participating';
    }

    return 'status-available';
  }

  trackByParticipant(index: number, participant: any): string {
    return participant.userId;
  }

  isAdmin(): boolean {
    return this.userService.user?.role === 'admin';
  }

  isLoggedIn(): boolean {
    return this.userService.isLogged;
  }
}
