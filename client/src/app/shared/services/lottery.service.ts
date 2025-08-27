import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Lottery {
  id: number;
  name: string;
  description: string;
  prize: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  participants: Participant[];
  winner: Participant | null;
  maxParticipants: number;
}

export interface Participant {
  userId: string;
  username: string;
  joinDate: string;
}

export interface LotteryResponse {
  success: boolean;
  data: Lottery;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LotteryService {
  private apiUrl = `/api/lottery`;

  constructor(private http: HttpClient) { }

  getLottery(): Observable<LotteryResponse> {
    return this.http.get<LotteryResponse>(this.apiUrl);
  }

  joinLottery(): Observable<LotteryResponse> {
    return this.http.post<LotteryResponse>(`${this.apiUrl}/join`, {}, { withCredentials: true });
  }

  drawWinner(): Observable<LotteryResponse> {
    return this.http.post<LotteryResponse>(`${this.apiUrl}/draw-winner`, {}, { withCredentials: true });
  }

  resetLottery(): Observable<LotteryResponse> {
    return this.http.post<LotteryResponse>(`${this.apiUrl}/reset`, {}, { withCredentials: true });
  }

  updateLottery(updates: Partial<Lottery>): Observable<LotteryResponse> {
    return this.http.put<LotteryResponse>(`${this.apiUrl}/update`, updates, { withCredentials: true });
  }

  isUserParticipating(lottery: Lottery, userId: string): boolean {
    return lottery.participants.some(p => p.userId === userId);
  }

  getTimeRemaining(endDate: string): { days: number; hours: number; minutes: number } {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }

  formatTimeRemaining(timeRemaining: { days: number; hours: number; minutes: number }): string {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days} дни, ${timeRemaining.hours} часа, ${timeRemaining.minutes} минути`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours} часа, ${timeRemaining.minutes} минути`;
    } else {
      return `${timeRemaining.minutes} минути`;
    }
  }
}
