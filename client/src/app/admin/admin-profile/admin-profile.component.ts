import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit {
  currentUser: any = null;
  userCount = 0;
  pendingRecipes = 0;

  totalRecipes = 0;
  activeSection: string = '';
  users: any[] = [];
  pendingRecipesList: any[] = [];


  // Course management properties
  courseCount = 0;
  coursesList: any[] = [];
  newCourse: any = {
    title: '',
    description: '',
    day: '',
    time: '',
    duration: 60,
    maxStudents: 10
  };

  // Course enrollment properties
  allEnrollments: any[] = [];
  courseEnrollments: any[] = [];
  selectedCourseId: string = '';
  enrollmentsSectionActive = false;

  // Contact message properties
  contactMessages: any[] = [];
  contactCount = 0;
  newContactCount = 0;

  // Lottery properties
  lotteryParticipants = 0;
  lotteryActive = false;
  lotteryData: any = null;

  constructor(private http: HttpClient, private router: Router) {
    console.log('🔧 AdminProfileComponent constructor called (from admin module)');
  }

  ngOnInit() {
    console.log('🎯 AdminProfileComponent ngOnInit() called');
    console.log('🔍 Component selector:', 'app-admin-profile');
    console.log('🔍 Component location:', 'admin/admin-profile/admin-profile.component.ts');

    this.checkAdminRole();
    this.loadAdminStats();
    this.loadAllEnrollments();

    console.log('🔍 ngOnInit completed');
    console.log('🔍 Initial activeSection:', this.activeSection);
    console.log('🔍 Initial users array:', this.users);
  }

  refreshDashboard() {
    console.log('🔄 Refreshing dashboard data...');
    this.loadAdminStats();
    this.loadAllEnrollments();
  }

  checkAdminRole() {
    console.log('🔍 AdminProfileComponent - checkAdminRole() called');

    const userStr = localStorage.getItem('currentUser');
    console.log('🔍 localStorage currentUser:', userStr);

    if (!userStr) {
      console.log('❌ No currentUser in localStorage, redirecting to admin login');
      this.router.navigate(['/admin/login']);
      return;
    }

    this.currentUser = JSON.parse(userStr);
    console.log('🔍 Parsed currentUser:', this.currentUser);
    console.log('🔍 User role:', this.currentUser.role);

    if (this.currentUser.role !== 'admin') {
      console.log('❌ User role is not admin, redirecting to admin login');
      this.router.navigate(['/admin/login']);
      return;
    }

    console.log('✅ Admin role check passed');
  }

  loadAdminStats() {
    console.log('🔍 loadAdminStats() called');
    // Load user count
    console.log('🔍 Making request to /api/admin/users');
    this.http.get('/api/admin/users', { withCredentials: true }).subscribe({
      next: (response: any) => {
        // Backend returns users array directly, not wrapped in 'users' property
        console.log('🔍 Raw response from /api/admin/users:', response);
        console.log('🔍 Response type:', typeof response);
        console.log('🔍 Is array:', Array.isArray(response));

        this.users = Array.isArray(response) ? response : [];
        this.userCount = this.users.length;
        console.log('✅ Users loaded:', this.userCount);
        console.log('✅ Users array:', this.users);
      },
      error: (err: any) => {
        console.error('❌ Error loading users:', err);
      }
    });

    // Load all themes and filter for pending ones
    this.http.get('/api/admin/themes', { withCredentials: true }).subscribe({
      next: (response: any) => {
        const allThemes = response || [];
        this.pendingRecipesList = allThemes.filter((theme: any) =>
          !theme.status || theme.status === 'pending'
        );
        this.pendingRecipes = this.pendingRecipesList.length;
        console.log('✅ Pending recipes loaded:', this.pendingRecipes);
      },
      error: (err: any) => {
        console.error('❌ Error loading themes:', err);
      }
    });



    // Load total recipes
    this.http.get('/api/themes', { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.totalRecipes = response.themes?.length || 0;
        console.log('✅ Total recipes loaded:', this.totalRecipes);
      },
      error: (err: any) => {
        console.error('❌ Error loading total recipes:', err);
      }
    });

    // Load courses
    this.http.get('/api/admin/courses', { withCredentials: true }).subscribe({
      next: (response: any) => {
        // Filter out any null or invalid course objects
        const rawCourses = response.courses || [];
        this.coursesList = rawCourses.filter((course: any) =>
          course &&
          course.title &&
          course.description &&
          course.day &&
          course.time
        );
        this.courseCount = this.coursesList.length;
        console.log('✅ Courses loaded:', this.courseCount);
        console.log('🔍 Raw courses data:', rawCourses);
        this.loadContactMessages();
        this.loadLotteryData();
      },
      error: (err: any) => {
        console.error('❌ Error loading courses:', err);
      }
    });
  }

  showUsersSection() {
    console.log('🔍 showUsersSection() called');
    this.activeSection = 'users';
    console.log('🔍 activeSection set to:', this.activeSection);
    console.log('🔍 Current users array:', this.users);
    console.log('🔍 User count:', this.userCount);
  }

  getAdminCount(): number {
    return this.users.filter(user => user.role === 'admin').length;
  }

  getUserCount(): number {
    return this.users.filter(user => user.role === 'user').length;
  }

  showModerationSection() {
    this.activeSection = 'moderation';
  }



  showStatsSection() {
    this.activeSection = 'stats';
  }

  showCoursesSection() {
    this.activeSection = 'courses';
  }

  changeUserRole(userId: string, newRole: string) {
    this.http.put(`/api/admin/users/${userId}/role`, { role: newRole }, { withCredentials: true }).subscribe({
      next: () => {
        this.loadAdminStats();
        console.log('✅ User role changed successfully');
      },
      error: (err: any) => {
        console.error('❌ Error changing user role:', err);
      }
    });
  }

  deleteUser(userId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете този потребител?')) {
      this.http.delete(`/api/admin/users/${userId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.loadAdminStats();
          console.log('✅ User deleted successfully');
        },
        error: (err: any) => {
          console.error('❌ Error deleting user:', err);
        }
      });
    }
  }

  approveRecipe(recipeId: string) {
    this.http.put(`/api/admin/themes/${recipeId}/approve`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.loadAdminStats();
        console.log('✅ Recipe approved successfully');
      },
      error: (err: any) => {
        console.error('❌ Error approving recipe:', err);
      }
    });
  }

  rejectRecipe(recipeId: string) {
    this.http.put(`/api/admin/themes/${recipeId}/reject`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.loadAdminStats();
        console.log('✅ Recipe rejected successfully');
      },
      error: (err: any) => {
        console.error('❌ Error rejecting recipe:', err);
      }
    });
  }

  deleteRecipe(recipeId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете тази рецепта?')) {
      this.http.delete(`/api/admin/themes/${recipeId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.loadAdminStats();
          console.log('✅ Recipe deleted successfully');
        },
        error: (err: any) => {
          console.error('❌ Error deleting recipe:', err);
        }
      });
    }
  }





  // Course management methods
  addCourse() {
    if (this.newCourse.title && this.newCourse.description && this.newCourse.day && this.newCourse.time) {
      this.http.post('/api/admin/courses', this.newCourse, { withCredentials: true }).subscribe({
        next: () => {
          // Reset form
          this.newCourse = {
            title: '',
            description: '',
            day: '',
            time: '',
            duration: 60,
            maxStudents: 10
          };
          this.loadAdminStats();
          console.log('✅ Course added successfully');
        },
        error: (err: any) => {
          console.error('❌ Error adding course:', err);
        }
      });
    } else {
      alert('Моля, попълнете всички задължителни полета!');
    }
  }

  editCourse(courseId: string) {
    // For now, just show an alert. You can implement a proper edit form later
    alert('Редактирането на курсове ще бъде добавено скоро!');
  }

  deleteCourse(courseId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете този курс?')) {
      this.http.delete(`/api/admin/courses/${courseId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.loadAdminStats();
          console.log('✅ Course deleted successfully');
        },
        error: (err: any) => {
          console.error('❌ Error deleting course:', err);
        }
      });
    }
  }

  // Course enrollment methods
  showEnrollmentsSection() {
    this.activeSection = 'enrollments';
    this.enrollmentsSectionActive = true;
    this.loadAllEnrollments();
  }

  loadAllEnrollments() {
    this.http.get('/api/admin/enrollments', { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.allEnrollments = response.enrollments || [];
        console.log('✅ All enrollments loaded:', this.allEnrollments.length);
      },
      error: (err: any) => {
        console.error('❌ Error loading enrollments:', err);
      }
    });
  }

  loadContactMessages() {
    this.http.get('/api/contact', { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.contactMessages = response.messages || [];
        this.contactCount = this.contactMessages.length;
        this.newContactCount = this.contactMessages.filter((msg: any) =>
          msg.status === 'new'
        ).length;
        console.log('✅ Contact messages loaded:', this.contactCount, 'New:', this.newContactCount);
      },
      error: (err: any) => {
        console.error('❌ Error loading contact messages:', err);
      }
    });
  }

  loadLotteryData() {
    this.http.get('/api/lottery', { withCredentials: true }).subscribe({
      next: (response: any) => {
        // Store full lottery data for admin view
        this.lotteryData = response.data || response;
        this.lotteryParticipants = this.lotteryData?.participants?.length || 0;
        this.lotteryActive = this.lotteryData?.isActive || false;
        console.log('✅ Lottery data loaded:', this.lotteryParticipants, 'Active:', this.lotteryActive);
        console.log('🔍 Full lottery data:', this.lotteryData);
      },
      error: (err: any) => {
        console.error('❌ Error loading lottery data:', err);
        // Set default values if API fails
        this.lotteryParticipants = 0;
        this.lotteryActive = false;
        this.lotteryData = null;
      }
    });
  }

  loadCourseEnrollments(courseId: string) {
    this.selectedCourseId = courseId;
    this.http.get(`/api/admin/courses/${courseId}/enrollments`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.courseEnrollments = response.enrollments || [];
        console.log(`✅ Course enrollments loaded for course ${courseId}:`, this.courseEnrollments.length);
      },
      error: (err: any) => {
        console.error('❌ Error loading course enrollments:', err);
      }
    });
  }

  getEnrollmentCountForCourse(courseId: string): number {
    if (!this.allEnrollments || !Array.isArray(this.allEnrollments)) {
      return 0;
    }
    return this.allEnrollments.filter(e => e.courseId === courseId).length;
  }

  refreshEnrollments() {
    this.loadAllEnrollments();
    if (this.selectedCourseId) {
      this.loadCourseEnrollments(this.selectedCourseId);
    }
  }

  // Contact message methods
  showContactSection() {
    this.router.navigate(['/admin/contact']);
  }





  updateContactStatus(messageId: string, status: string, adminReply?: string) {
    const updateData: any = { status };
    if (adminReply) {
      updateData.adminReply = adminReply;
    }

    this.http.put(`/api/contact/${messageId}`, updateData, { withCredentials: true }).subscribe({
      next: () => {
        this.loadContactMessages();
        console.log('✅ Contact message status updated');
      },
      error: (err: any) => {
        console.error('❌ Error updating contact message status:', err);
      }
    });
  }

  deleteContactMessage(messageId: string) {
    if (confirm('Сигурни ли сте, че искате да изтриете това съобщение?')) {
      this.http.delete(`/api/contact/${messageId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.loadContactMessages();
          console.log('✅ Contact message deleted');
        },
        error: (err: any) => {
          console.error('❌ Error deleting contact message:', err);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'new': return 'badge-new';
      case 'read': return 'badge-read';
      case 'replied': return 'badge-replied';
      case 'archived': return 'badge-archived';
      default: return 'badge-default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'new': return 'Ново';
      case 'read': return 'Прочетено';
      case 'replied': return 'Отговорено';
      case 'archived': return 'Архивирано';
      default: return 'Неизвестно';
    }
  }

  // Lottery methods
  showLotterySection() {
    this.activeSection = 'lottery';
    this.loadLotteryData();
  }

  // Enrollment helper methods
  getEnrollmentStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Активен';
      case 'completed': return 'Завършен';
      case 'cancelled': return 'Отменен';
      default: return 'Неизвестен';
    }
  }

  viewEnrollmentDetails(enrollment: any): void {
    // For now, just show an alert with details
    const details = `
Детайли за запис:
Курс: ${enrollment.courseTitle || 'Неизвестен'}
Студент: ${enrollment.studentName || 'Неизвестен'}
Email: ${enrollment.studentEmail || 'Неизвестен'}
Дата: ${enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString('bg-BG') : 'Неизвестна'}
Статус: ${this.getEnrollmentStatusText(enrollment.status)}
    `;
    alert(details);
  }

  removeEnrollment(enrollmentId: string): void {
    if (confirm('Сигурни ли сте, че искате да премахнете този запис?')) {
      this.http.delete(`/api/admin/enrollments/${enrollmentId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.loadAllEnrollments();
          console.log('✅ Enrollment removed successfully');
        },
        error: (err: any) => {
          console.error('❌ Error removing enrollment:', err);
          alert('Грешка при премахване на записа');
        }
      });
    }
  }

}
