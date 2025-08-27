import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {
    constructor(
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    /**
     * Handle HTTP errors from API calls
     */
    handleHttpError(error: HttpErrorResponse, customMessage?: string): void {
        let message = customMessage || this.getErrorMessage(error);

        // Log error for debugging
        console.error('HTTP Error:', error);

        // Show error message to user
        this.showError(message);

        // Handle specific error cases
        this.handleSpecificErrors(error);
    }

    /**
     * Handle general application errors
     */
    handleError(error: Error | string, customMessage?: string): void {
        const message = customMessage || (typeof error === 'string' ? error : error.message);

        // Log error for debugging
        console.error('Application Error:', error);

        // Show error message to user
        this.showError(message);
    }

    /**
     * Handle validation errors
     */
    handleValidationError(errors: any[]): void {
        if (errors && errors.length > 0) {
            const message = errors.map(err => err.msg || err.message).join('\n');
            this.showError(message);
        } else {
            this.showError(ERROR_MESSAGES.VALIDATION_ERROR);
        }
    }

    /**
     * Handle file upload errors
     */
    handleFileUploadError(error: any): void {
        let message = ERROR_MESSAGES.FILE_TOO_LARGE;

        if (error?.code === 'LIMIT_FILE_SIZE') {
            message = ERROR_MESSAGES.FILE_TOO_LARGE;
        } else if (error?.code === 'LIMIT_FILE_COUNT') {
            message = 'Твърде много файлове. Максималният брой е 1.';
        } else if (error?.code === 'LIMIT_UNEXPECTED_FILE') {
            message = ERROR_MESSAGES.INVALID_FILE_TYPE;
        } else if (error?.message) {
            message = error.message;
        }

        this.showError(message);
    }

    /**
     * Get appropriate error message based on HTTP status
     */
    private getErrorMessage(error: HttpErrorResponse): string {
        switch (error.status) {
            case HTTP_STATUS.BAD_REQUEST:
                return ERROR_MESSAGES.VALIDATION_ERROR;

            case HTTP_STATUS.UNAUTHORIZED:
                return ERROR_MESSAGES.UNAUTHORIZED;

            case HTTP_STATUS.FORBIDDEN:
                return ERROR_MESSAGES.FORBDEN;

            case HTTP_STATUS.NOT_FOUND:
                return ERROR_MESSAGES.NOT_FOUND;

            case HTTP_STATUS.CONFLICT:
                return 'Конфликт в данните. Моля, проверете въведената информация.';

            case HTTP_STATUS.UNPROCESSABLE_ENTITY:
                return ERROR_MESSAGES.VALIDATION_ERROR;

            case HTTP_STATUS.TOO_MANY_REQUESTS:
                return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;

            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                return ERROR_MESSAGES.SERVER_ERROR;

            case HTTP_STATUS.SERVICE_UNAVAILABLE:
                return 'Службата е временно недостъпна. Моля, опитайте по-късно.';

            case 0:
                return ERROR_MESSAGES.NETWORK_ERROR;

            default:
                return error.error?.message || error.message || ERROR_MESSAGES.SERVER_ERROR;
        }
    }

    /**
     * Handle specific error cases that require special handling
     */
    private handleSpecificErrors(error: HttpErrorResponse): void {
        switch (error.status) {
            case HTTP_STATUS.UNAUTHORIZED:
                // Redirect to login if unauthorized
                this.router.navigate(['/auth/login']);
                break;

            case HTTP_STATUS.FORBIDDEN:
                // Redirect to home if forbidden
                this.router.navigate(['/']);
                break;

            case HTTP_STATUS.NOT_FOUND:
                // Redirect to 404 page if resource not found
                this.router.navigate(['/404']);
                break;

            case 0:
                // Network error - could show offline indicator
                this.handleNetworkError();
                break;
        }
    }

    /**
     * Handle network errors
     */
    private handleNetworkError(): void {
        // Could implement offline detection logic here
        console.warn('Network error detected - possible offline state');
    }

    /**
     * Show error message using snackbar
     */
    private showError(message: string): void {
        this.snackBar.open(message, 'Затвори', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
        });
    }

    /**
     * Show success message using snackbar
     */
    showSuccess(message: string): void {
        this.snackBar.open(message, 'Затвори', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
        });
    }

    /**
     * Show warning message using snackbar
     */
    showWarning(message: string): void {
        this.snackBar.open(message, 'Затвори', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['warning-snackbar']
        });
    }

    /**
     * Show info message using snackbar
     */
    showInfo(message: string): void {
        this.snackBar.open(message, 'Затвори', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['info-snackbar']
        });
    }

    /**
     * Check if error is a network error
     */
    isNetworkError(error: any): boolean {
        return error.status === 0 ||
            error.status === HTTP_STATUS.SERVICE_UNAVAILABLE ||
            !navigator.onLine;
    }

    /**
     * Check if error is a validation error
     */
    isValidationError(error: any): boolean {
        return error.status === HTTP_STATUS.BAD_REQUEST ||
            error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY;
    }

    /**
     * Check if error is an authentication error
     */
    isAuthenticationError(error: any): boolean {
        return error.status === HTTP_STATUS.UNAUTHORIZED;
    }

    /**
     * Check if error is an authorization error
     */
    isAuthorizationError(error: any): boolean {
        return error.status === HTTP_STATUS.FORBIDDEN;
    }

    /**
     * Get user-friendly error message for specific error types
     */
    getUserFriendlyMessage(error: any): string {
        if (this.isNetworkError(error)) {
            return ERROR_MESSAGES.NETWORK_ERROR;
        }

        if (this.isValidationError(error)) {
            return ERROR_MESSAGES.VALIDATION_ERROR;
        }

        if (this.isAuthenticationError(error)) {
            return ERROR_MESSAGES.UNAUTHORIZED;
        }

        if (this.isAuthorizationError(error)) {
            return ERROR_MESSAGES.FORBIDDEN;
        }

        return this.getErrorMessage(error);
    }
}
