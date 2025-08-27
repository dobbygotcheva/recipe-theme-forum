import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { Comment, Theme } from 'src/app/shared/interfaces/theme';
import { UserService } from 'src/app/user/user.service';

@Component({
	selector: 'app-current-theme',
	templateUrl: './current-theme.component.html',
	styleUrls: ['./current-theme.component.scss']
})
export class CurrentThemeComponent implements OnInit {
	theme: Theme | undefined;
	commentForm: FormGroup;
	replyForm: FormGroup;
	userRating: number = 0;
	showRatingForm: boolean = false;
	replyingTo: string | null = null;

	constructor(
		private apiService: ApiService,
		private userService: UserService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private dialog: MatDialog,
		private fb: FormBuilder,
		private sanitizer: DomSanitizer
	) {
		this.commentForm = this.fb.group({
			text: ['', [Validators.required, Validators.minLength(3)]]
		});
		this.replyForm = this.fb.group({
			text: ['', [Validators.required, Validators.minLength(3)]]
		});
	}

	get isLogged(): boolean {
		return this.userService.isLogged;
	}

	ngOnInit(): void {
		this.fetchTheme();
	}

	id = this.activatedRoute.snapshot.params['themeId'];

	fetchTheme(): void {
		this.apiService.getTheme(this.id).subscribe((theme) => {
			this.theme = theme;
			this.checkUserRating();
			// Fetch comments separately to get proper hierarchical structure
			this.fetchComments();
		});
	}

	fetchComments(): void {
		this.apiService.getComments(this.id).subscribe((commentsResponse) => {
			if (this.theme && commentsResponse.comments) {
				this.theme.comments = commentsResponse.comments;
			}
		});
	}

	reloadTheme(): void {
		// Reload theme to revert optimistic changes on error
		this.apiService.getTheme(this.id).subscribe((theme) => {
			this.theme = theme;
			this.checkUserRating();
			// Fetch comments separately to get proper hierarchical structure
			this.fetchComments();
		});
	}

	get isOwner(): boolean {
		return this.userService.user?._id === this.theme?.userId;
	}

	// YouTube URL helper method
	getYouTubeEmbedUrl(url: string): SafeResourceUrl {
		if (!url) {
			return this.sanitizer.bypassSecurityTrustResourceUrl('');
		}
		const videoId = this.extractYouTubeId(url);
		if (videoId) {
			const embedUrl = `https://www.youtube.com/embed/${videoId}`;
			return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
		}
		return this.sanitizer.bypassSecurityTrustResourceUrl('');
	}

	extractYouTubeId(url: string): string | null {
		if (!url) return null;
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : null;
	}

	deleteCurrentTheme() {
		// Double-check security: only owners can delete
		if (!this.isOwner) {
			console.error('Security violation: User attempted to delete theme they do not own');
			alert('You are not authorized to delete this recipe!');
			return;
		}

		const dialogRef = this.dialog.open(ConfirmationDialogComponent)

		dialogRef.afterClosed().subscribe(result => {
			if (result === true) {
				// Triple-check security before API call
				if (!this.isOwner) {
					console.error('Security violation: User attempted to delete theme they do not own');
					alert('You are not authorized to delete this recipe!');
					return;
				}

				this.apiService.delTheme(this.id).subscribe({
					next: (theme) => {
						console.log('Рецептата е изтрита');
						this.router.navigate(['/themes'])
					},
					error: (error) => {
						console.error('Error occurred during theme deletion:', error)
						if (error.status === 401) {
							alert('You are not authorized to delete this recipe!');
						} else {
							alert('Error deleting recipe. Please try again.');
						}
					}
				});
			}
		});
	}

	onImageError(event: any): void {
		// Fallback to default image if image fails to load
		event.target.src = 'assets/logo.jpg';
	}

	onAvatarError(event: any): void {
		// Fallback to default avatar if avatar fails to load
		event.target.src = 'assets/profile.png';
	}

	getUserAvatar(userId: string): string {
		// Try to get the current user's avatar if it's their comment
		if (this.userService.user?._id === userId && this.userService.user?.avatar) {
			// Check if the avatar is a full URL or a relative path
			const avatarUrl = this.userService.user.avatar;
			console.log(`Getting avatar for user ${userId}:`, avatarUrl);
			
			if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
				console.log('Using full URL avatar:', avatarUrl);
				return avatarUrl;
			} else if (avatarUrl.startsWith('/uploads/')) {
				// Extract filename from /uploads/filename
				const filename = avatarUrl.split('/').pop();
				const finalUrl = `/api/users/avatar/${filename}`;
				console.log('Using uploads avatar:', finalUrl);
				return finalUrl;
			} else if (avatarUrl.startsWith('/')) {
				console.log('Using absolute path avatar:', avatarUrl);
				return avatarUrl;
			} else {
				// If it's just a filename, construct the full URL
				const finalUrl = `/api/users/avatar/${avatarUrl}`;
				console.log('Using filename avatar:', finalUrl);
				return finalUrl;
			}
		}
		
		// For other users, try to get their avatar from the API
		// You can implement a user lookup service here
		// For now, return a default avatar
		console.log(`No avatar found for user ${userId}, using default`);
		return 'assets/profile.png';
	}

	// Rating functionality
	rateRecipe(rating: number): void {
		if (!this.isLogged) {
			alert('Please log in to rate recipes');
			return;
		}

		this.apiService.addRating(this.id, rating).subscribe({
			next: (response) => {
				console.log('Rating added successfully:', response);
				this.userRating = rating;
				this.fetchTheme(); // Refresh to get updated ratings
				this.showRatingForm = false;
			},
			error: (error) => {
				console.error('Error adding rating:', error);
				alert('Error adding rating. Please try again.');
			}
		});
	}

	checkUserRating(): void {
		if (!this.isLogged || !this.theme) return;

		const userRating = this.theme.ratings.find(r => r.userId === this.userService.user?._id);
		this.userRating = userRating ? userRating.rating : 0;
	}

	getStarClass(rating: number, starValue: number): string {
		if (rating >= starValue) {
			return 'star-filled';
		}
		return 'star-empty';
	}

	// Comment functionality
	submitComment(): void {
		if (!this.isLogged) {
			alert('Please log in to add comments');
			return;
		}

		if (this.commentForm.valid) {
			const text = this.commentForm.get('text')?.value;

			this.apiService.addComment(this.id, text).subscribe({
				next: (response) => {
					console.log('Comment added successfully:', response);
					this.commentForm.reset();
					this.fetchComments(); // Refresh comments to get hierarchical structure
				},
				error: (error) => {
					console.error('Error adding comment:', error);
					alert('Error adding comment. Please try again.');
				}
			});
		}
	}

	submitReply(): void {
		if (!this.isLogged) {
			alert('Please log in to add replies');
			return;
		}

		if (this.replyForm.get('text')?.value && this.replyingTo) {
			const text = this.replyForm.get('text')?.value;

			this.apiService.addReply(this.id, this.replyingTo, text).subscribe({
				next: (response) => {
					console.log('Reply added successfully:', response);
					this.replyForm.reset();
					this.replyingTo = null;
					this.fetchComments(); // Refresh comments to get hierarchical structure
				},
				error: (error) => {
					console.error('Error adding reply:', error);
					alert('Error adding reply. Please try again.');
				}
			});
		}
	}

	startReply(commentId: string): void {
		this.replyingTo = commentId;
		this.replyForm.reset();
	}

	cancelReply(): void {
		this.replyingTo = null;
		this.replyForm.reset();
	}

	deleteComment(commentId: string): void {
		this.apiService.deleteComment(this.id, commentId).subscribe({
			next: (response) => {
				console.log('Comment deleted successfully:', response);
				this.fetchComments(); // Refresh comments to get hierarchical structure
			},
			error: (error) => {
				console.error('Error deleting comment:', error);
				alert('Error deleting comment. Please try again.');
			}
		});
	}

	canDeleteComment(comment: Comment): boolean {
		return this.isLogged && comment.userId === this.userService.user?._id;
	}

	isCurrentUserComment(userId: string): boolean {
		return this.userService.user?._id === userId;
	}

	getAverageRating(): number {
		return this.theme?.averageRating || 0;
	}

	getTotalRatings(): number {
		return this.theme?.totalRatings || 0;
	}

	// Comment like/dislike functionality
	likeComment(comment: Comment): void {
		if (!this.isLogged) {
			alert('Please log in to like comments');
			return;
		}

		const userId = this.userService.user?._id;
		if (!userId || !this.theme) return;

		// Ensure likes and dislikes arrays are initialized
		if (!comment.likes) comment.likes = [];
		if (!comment.dislikes) comment.dislikes = [];

		// Optimistically update the UI immediately
		if (comment.likes.includes(userId)) {
			// Unlike
			comment.likes = comment.likes.filter((id: string) => id !== userId);
		} else {
			// Like
			comment.likes.push(userId);
			// Remove from dislikes if previously disliked
			comment.dislikes = comment.dislikes.filter((id: string) => id !== userId);
		}

		// Make API call in background
		this.apiService.likeComment(this.id, comment._id).subscribe({
			next: (response) => {
				console.log('Comment liked successfully:', response);
				// No need to refresh, UI is already updated
			},
			error: (error) => {
				console.error('Error liking comment:', error);
				// Revert the optimistic update on error
				this.reloadTheme();
				alert('Error liking comment. Please try again.');
			}
		});
	}

	dislikeComment(comment: Comment): void {
		if (!this.isLogged) {
			alert('Please log in to dislike comments');
			return;
		}

		const userId = this.userService.user?._id;
		if (!userId || !this.theme) return;

		// Ensure likes and dislikes arrays are initialized
		if (!comment.likes) comment.likes = [];
		if (!comment.dislikes) comment.dislikes = [];

		// Optimistically update the UI immediately
		if (comment.dislikes.includes(userId)) {
			// Undislike
			comment.dislikes = comment.dislikes.filter((id: string) => id !== userId);
		} else {
			// Dislike
			comment.dislikes.push(userId);
			// Remove from likes if previously liked
			comment.likes = comment.likes.filter((id: string) => id !== userId);
		}

		// Make API call in background
		this.apiService.dislikeComment(this.id, comment._id).subscribe({
			next: (response) => {
				console.log('Comment disliked successfully:', response);
				// No need to refresh, UI is already updated
			},
			error: (error) => {
				console.error('Error disliking comment:', error);
				// Revert the optimistic update on error
				this.reloadTheme();
				alert('Error disliking comment. Please try again.');
			}
		});
	}

	hasUserLiked(comment: Comment): boolean {
		if (!this.isLogged || !this.userService.user) return false;
		if (!comment.likes) return false;
		return comment.likes.includes(this.userService.user._id);
	}

	hasUserDisliked(comment: Comment): boolean {
		if (!this.isLogged || !this.userService.user) return false;
		if (!comment.dislikes) return false;
		return comment.dislikes.includes(this.userService.user._id);
	}

	getLikeCount(comment: Comment): number {
		return comment.likes ? comment.likes.length : 0;
	}

	getDislikeCount(comment: Comment): number {
		return comment.dislikes ? comment.dislikes.length : 0;
	}

}
