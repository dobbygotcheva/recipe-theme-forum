import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { CourseSchedule } from '../../shared/interfaces/course-schedule';
import { Theme } from '../../shared/interfaces/theme';
import { User } from '../../shared/interfaces/user';

@Component({
  selector: 'app-course-schedule-management',
  templateUrl: './course-schedule-management.component.html',
  styleUrls: ['./course-schedule-management.component.scss']
})
export class CourseScheduleManagementComponent implements OnInit {
  courseSchedules: CourseSchedule[] = [];
  themes: Theme[] = [];
  users: User[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  editingSchedule: CourseSchedule | null = null;

  courseForm: FormGroup;
  weekDays = [
    { value: 'monday', label: 'Понеделник' },
    { value: 'tuesday', label: 'Вторник' },
    { value: 'wednesday', label: 'Сряда' },
    { value: 'thursday', label: 'Четвъртък' },
    { value: 'friday', label: 'Петък' },
    { value: 'saturday', label: 'Събота' },
    { value: 'sunday', label: 'Неделя' }
  ];

  difficulties = [
    { value: 'beginner', label: 'Начинаещ' },
    { value: 'intermediate', label: 'Среден' },
    { value: 'advanced', label: 'Напреднал' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      weekStartDate: ['', Validators.required],
      weekEndDate: ['', Validators.required],
      maxParticipants: [null],
      price: [null],
      instructorId: ['', Validators.required],
      courses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    try {
      console.log('🎯 CourseScheduleManagementComponent loaded successfully!');
      console.log('🔍 Component selector:', 'app-course-schedule-management');
      console.log('📁 Component location:', 'admin/course-schedule-management');
      console.log('📋 Form initialized:', this.courseForm);
      console.log('📅 Week days:', this.weekDays);
      console.log('🎯 Difficulties:', this.difficulties);

      this.loadCourseSchedules();
      this.loadThemes();
      this.loadUsers();
    } catch (error) {
      console.error('❌ Error in ngOnInit:', error);
    }
  }

  testClick(): void {
    alert('🎉 TEST BUTTON CLICKED! Component is working!');
    console.log('✅ Test button clicked successfully!');
  }

  getCurrentTime(): string {
    return new Date().toLocaleString();
  }

  get coursesArray(): FormArray {
    return this.courseForm.get('courses') as FormArray;
  }

  addCourse(): void {
    const course = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      recipeId: [''],
      difficulty: ['beginner', Validators.required],
      duration: [60, Validators.required],
      maxParticipants: [null],
      materials: [''],
      notes: ['']
    });

    this.coursesArray.push(course);
  }

  removeCourse(index: number): void {
    this.coursesArray.removeAt(index);
  }

  loadCourseSchedules(): void {
    this.loading = true;
    this.error = null;

    try {
      // TODO: Replace with actual API call
      this.apiService.getCourseSchedules().subscribe({
        next: (schedules) => {
          console.log('✅ Course schedules loaded:', schedules);
          this.courseSchedules = schedules;
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error loading course schedules:', err);
          this.error = 'Failed to load course schedules: ' + (err.message || err);
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('❌ Exception in loadCourseSchedules:', error);
      this.error = 'Exception loading course schedules: ' + (error instanceof Error ? error.message : String(error));
      this.loading = false;
    }
  }

  loadThemes(): void {
    this.apiService.getThemes().subscribe({
      next: (themes) => {
        this.themes = themes;
      },
      error: (err) => {
        console.error('Error loading themes:', err);
      }
    });
  }

  loadUsers(): void {
    // TODO: Replace with actual API call
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const formValue = this.courseForm.value;

      if (this.editingSchedule) {
        this.updateCourseSchedule(formValue);
      } else {
        this.createCourseSchedule(formValue);
      }
    }
  }

  createCourseSchedule(scheduleData: any): void {
    this.loading = true;
    // TODO: Replace with actual API call
    this.apiService.createCourseSchedule(scheduleData).subscribe({
      next: (newSchedule) => {
        this.courseSchedules.push(newSchedule);
        this.resetForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating course schedule:', err);
        this.loading = false;
      }
    });
  }

  updateCourseSchedule(scheduleData: any): void {
    if (!this.editingSchedule) return;

    this.loading = true;
    // TODO: Replace with actual API call
    this.apiService.updateCourseSchedule(this.editingSchedule._id, scheduleData).subscribe({
      next: (updatedSchedule) => {
        const index = this.courseSchedules.findIndex(s => s._id === updatedSchedule._id);
        if (index !== -1) {
          this.courseSchedules[index] = updatedSchedule;
        }
        this.resetForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating course schedule:', err);
        this.loading = false;
      }
    });
  }

  editSchedule(schedule: CourseSchedule): void {
    this.editingSchedule = schedule;
    this.showEditForm = true;
    this.showCreateForm = false;

    // Populate form with existing data
    this.courseForm.patchValue({
      title: schedule.title,
      description: schedule.description,
      weekStartDate: schedule.weekStartDate,
      weekEndDate: schedule.weekEndDate,
      maxParticipants: schedule.maxParticipants,
      price: schedule.price,
      instructorId: schedule.instructorId
    });

    // Clear and populate courses array
    while (this.coursesArray.length !== 0) {
      this.coursesArray.removeAt(0);
    }

    schedule.courses.forEach(course => {
      this.coursesArray.push(this.fb.group({
        dayOfWeek: [course.dayOfWeek, Validators.required],
        startTime: [course.startTime, Validators.required],
        endTime: [course.endTime, Validators.required],
        title: [course.title, Validators.required],
        description: [course.description, Validators.required],
        recipeId: [course.recipeId || ''],
        difficulty: [course.difficulty, Validators.required],
        duration: [course.duration, Validators.required],
        maxParticipants: [course.maxParticipants || null],
        materials: [course.materials?.join(', ') || ''],
        notes: [course.notes || '']
      }));
    });
  }

  deleteSchedule(scheduleId: string): void {
    if (confirm('Are you sure you want to delete this course schedule?')) {
      this.loading = true;
      // TODO: Replace with actual API call
      this.apiService.deleteCourseSchedule(scheduleId).subscribe({
        next: () => {
          this.courseSchedules = this.courseSchedules.filter(s => s._id !== scheduleId);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error deleting course schedule:', err);
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.courseForm.reset();
    this.editingSchedule = null;
    this.showCreateForm = false;
    this.showEditForm = false;

    // Clear courses array
    while (this.coursesArray.length !== 0) {
      this.coursesArray.removeAt(0);
    }
  }

  toggleStatus(schedule: CourseSchedule, newStatus: 'draft' | 'published' | 'completed' | 'cancelled'): void {
    this.loading = true;
    // TODO: Replace with actual API call
    this.apiService.updateCourseScheduleStatus(schedule._id, newStatus).subscribe({
      next: (updatedSchedule) => {
        const index = this.courseSchedules.findIndex(s => s._id === updatedSchedule._id);
        if (index !== -1) {
          this.courseSchedules[index] = updatedSchedule;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'draft': return 'badge-secondary';
      case 'published': return 'badge-success';
      case 'completed': return 'badge-info';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'draft': return 'Чернова';
      case 'published': return 'Публикуван';
      case 'completed': return 'Завършен';
      case 'cancelled': return 'Отменен';
      default: return 'Неизвестен';
    }
  }

  getDayLabel(day: string): string {
    const dayObj = this.weekDays.find(d => d.value === day);
    return dayObj ? dayObj.label : day;
  }

  getDifficultyLabel(difficulty: string): string {
    const diffObj = this.difficulties.find(d => d.value === difficulty);
    return diffObj ? diffObj.label : difficulty;
  }
}
