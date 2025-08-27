import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CourseSchedule } from './shared/interfaces/course-schedule';
import { Theme } from './shared/interfaces/theme';
import { UserService } from './user/user.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private userService: UserService) { }

  // Themes
  getTheme(id: string) {
    return this.http.get<Theme>(`/api/themes/${id}`);
  }

  delTheme(id: string) {
    return this.http.delete<Theme>(`/api/themes/${id}`, { withCredentials: true });
  }

  // title, category, img,time,ingredients,  text, userId
  createTheme(title: string, category: string, img: string, time: number, ingredients: string, text: string, userId: string) {
    return this.http.post<Theme>('/api/themes', { title, category, img, time, ingredients, text, userId });
  }

  // Create theme with file uploads (images and videos)
  createThemeWithFiles(formData: FormData) {
    return this.http.post<Theme>('/api/themes', formData);
  }

  getThemes() {
    return this.http.get<Theme[]>('/api/themes');
  }

  getThemesByUser(userId: string | undefined) {
    return this.http.get<Theme[]>(`/api/themes?userId=${userId}`);
  }

  editTheme(id: string, title: string, category: string, img: string, time: number, ingredients: string, text: string, userId: string) {
    return this.http.put<Theme>(`/api/themes/${id}`, { title, category, img, time, ingredients, text }, { withCredentials: true });
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>('/api/upload', formData);
  }

  // Ratings
  addRating(themeId: string, rating: number) {
    return this.http.post<any>(`/api/ratings/${themeId}/rate`, { rating }, { withCredentials: true });
  }

  getRatings(themeId: string) {
    return this.http.get<any>(`/api/ratings/${themeId}/ratings`, { withCredentials: true });
  }

  // Comments
  addComment(themeId: string, text: string, parentCommentId?: string) {
    return this.http.post<any>(`/api/ratings/${themeId}/comments`, { text, parentCommentId }, { withCredentials: true });
  }

  addReply(themeId: string, commentId: string, text: string) {
    return this.http.post<any>(`/api/ratings/${themeId}/comments/${commentId}/replies`, { text }, { withCredentials: true });
  }

  getComments(themeId: string) {
    return this.http.get<any>(`/api/ratings/${themeId}/comments`, { withCredentials: true });
  }

  deleteComment(themeId: string, commentId: string) {
    return this.http.delete<any>(`/api/ratings/${themeId}/comments/${commentId}`, { withCredentials: true });
  }

  // Comment likes/dislikes
  likeComment(themeId: string, commentId: string) {
    return this.http.post<any>(`/api/ratings/${themeId}/comments/${commentId}/like`, {}, { withCredentials: true });
  }

  dislikeComment(themeId: string, commentId: string) {
    return this.http.post<any>(`/api/ratings/${themeId}/comments/${commentId}/dislike`, {}, { withCredentials: true });
  }

  // Course Schedules
  getCourseSchedules() {
    return this.http.get<CourseSchedule[]>('/api/course-schedules');
  }

  getCourseSchedule(id: string) {
    return this.http.get<CourseSchedule>(`/api/course-schedules/${id}`);
  }

  getPublishedCourseSchedules() {
    return this.http.get<CourseSchedule[]>('/api/course-schedules/published');
  }

  getIndividualCourses() {
    return this.http.get<any[]>('/api/courses');
  }

  createCourseSchedule(scheduleData: any) {
    return this.http.post<CourseSchedule>('/api/course-schedules', scheduleData);
  }

  updateCourseSchedule(id: string, scheduleData: any) {
    return this.http.put<CourseSchedule>(`/api/course-schedules/${id}`, scheduleData);
  }

  deleteCourseSchedule(id: string) {
    return this.http.delete<any>(`/api/course-schedules/${id}`);
  }

  updateCourseScheduleStatus(id: string, status: string) {
    return this.http.patch<CourseSchedule>(`/api/course-schedules/${id}/status`, { status });
  }

  // Users (for admin)
  getUsers() {
    return this.http.get<any[]>('/api/users');
  }

  // Course Enrollments
  enrollInCourse(courseId: string, userId: string) {
    return this.http.post<any>('/api/courses/enroll', { courseId, userId });
  }

  getUserEnrollments(userId: string) {
    return this.http.get<any[]>(`/api/courses/enrollments/${userId}`);
  }

  unenrollFromCourse(courseId: string, userId: string) {
    return this.http.delete<any>(`/api/courses/enroll/${courseId}/${userId}`);
  }
}