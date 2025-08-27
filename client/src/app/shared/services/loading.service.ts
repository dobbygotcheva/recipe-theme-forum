import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
    isLoading: boolean;
    message?: string;
    progress?: number;
}

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject = new BehaviorSubject<LoadingState>({
        isLoading: false
    });

    public loading$: Observable<LoadingState> = this.loadingSubject.asObservable();

    /**
     * Show loading with optional message
     */
    show(message?: string): void {
        this.loadingSubject.next({
            isLoading: true,
            message: message || 'Зареждане...'
        });
    }

    /**
     * Hide loading
     */
    hide(): void {
        this.loadingSubject.next({
            isLoading: false
        });
    }

    /**
     * Update loading message
     */
    updateMessage(message: string): void {
        const currentState = this.loadingSubject.value;
        this.loadingSubject.next({
            ...currentState,
            message
        });
    }

    /**
     * Update loading progress (0-100)
     */
    updateProgress(progress: number): void {
        const currentState = this.loadingSubject.value;
        this.loadingSubject.next({
            ...currentState,
            progress: Math.max(0, Math.min(100, progress))
        });
    }

    /**
     * Show loading with progress tracking
     */
    showWithProgress(message?: string): void {
        this.loadingSubject.next({
            isLoading: true,
            message: message || 'Зареждане...',
            progress: 0
        });
    }

    /**
     * Get current loading state
     */
    getCurrentState(): LoadingState {
        return this.loadingSubject.value;
    }

    /**
     * Check if currently loading
     */
    get isLoading(): boolean {
        return this.loadingSubject.value.isLoading;
    }

    /**
     * Get current loading message
     */
    get currentMessage(): string | undefined {
        return this.loadingSubject.value.message;
    }

    /**
     * Get current progress
     */
    get currentProgress(): number | undefined {
        return this.loadingSubject.value.progress;
    }

    /**
     * Simulate progress for operations where progress can't be tracked
     */
    simulateProgress(duration: number = 2000, steps: number = 10): void {
        this.showWithProgress('Обработване...');

        const interval = duration / steps;
        let currentStep = 0;

        const progressInterval = setInterval(() => {
            currentStep++;
            const progress = (currentStep / steps) * 100;

            this.updateProgress(progress);

            if (currentStep >= steps) {
                clearInterval(progressInterval);
                this.hide();
            }
        }, interval);
    }

    /**
     * Show loading for a specific duration
     */
    showTemporary(message: string, duration: number = 1000): void {
        this.show(message);

        setTimeout(() => {
            this.hide();
        }, duration);
    }

    /**
     * Show loading with success message
     */
    showSuccess(message: string, duration: number = 2000): void {
        this.hide();

        // Could integrate with notification service here
        setTimeout(() => {
            // Show success state briefly
            this.show(message);
            setTimeout(() => this.hide(), duration);
        }, 100);
    }

    /**
     * Show loading with error message
     */
    showError(message: string, duration: number = 3000): void {
        this.hide();

        // Could integrate with error handling service here
        setTimeout(() => {
            // Show error state briefly
            this.show(message);
            setTimeout(() => this.hide(), duration);
        }, 100);
    }
}
