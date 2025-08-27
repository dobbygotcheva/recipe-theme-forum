import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  loading = false;
  error: string | null = null;
  isLoggedIn = false;
  currentUser: any = null;
  userEnrollments: string[] = [];



  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.checkUserStatus();
    this.loadCourses();
    this.loadUserEnrollments();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = null;

    // Load individual courses from admin system
    this.apiService.getIndividualCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.error = 'Грешка при зареждане на курсовете';
        this.loading = false;
      }
    });
  }

  checkUserStatus(): void {
    this.userService.user$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  loadUserEnrollments(): void {
    if (this.isLoggedIn && this.currentUser) {
      this.apiService.getUserEnrollments(this.currentUser._id).subscribe({
        next: (enrollments) => {
          this.userEnrollments = enrollments.map((e: any) => e.courseId);
        },
        error: (err) => {
          console.error('Error loading user enrollments:', err);
        }
      });
    }
  }

  isEnrolled(courseId: string): boolean {
    return this.userEnrollments.includes(courseId);
  }

  enrollInCourse(course: any): void {
    if (!this.isLoggedIn || !this.currentUser) {
      alert('Моля, влезте в профила си за да се запишете в курс!');
      return;
    }

    if (course.enrolledStudents >= course.maxStudents) {
      alert('Този курс е пълен!');
      return;
    }

    this.apiService.enrollInCourse(course._id, this.currentUser._id).subscribe({
      next: (response) => {
        console.log('Successfully enrolled in course:', response);
        this.userEnrollments.push(course._id);
        // Update course enrollment count
        course.enrolledStudents = (course.enrolledStudents || 0) + 1;
        alert('Успешно се записахте в курса!');
        // Refresh courses to get updated enrollment data
        this.loadCourses();
      },
      error: (err) => {
        console.error('Error enrolling in course:', err);
        alert('Грешка при записване в курса. Моля, опитайте отново.');
      }
    });
  }

  unenrollFromCourse(course: any): void {
    if (!this.isLoggedIn || !this.currentUser) {
      return;
    }

    if (confirm('Сигурни ли сте, че искате да се отпишете от този курс?')) {
      this.apiService.unenrollFromCourse(course._id, this.currentUser._id).subscribe({
        next: (response) => {
          console.log('Successfully unenrolled from course:', response);
          // Remove from user enrollments
          const index = this.userEnrollments.indexOf(course._id);
          if (index > -1) {
            this.userEnrollments.splice(index, 1);
          }
          // Update course enrollment count
          course.enrolledStudents = Math.max(0, (course.enrolledStudents || 0) - 1);
          alert('Успешно се отписахте от курса!');
          // Refresh courses to get updated enrollment data
          this.loadCourses();
        },
        error: (err) => {
          console.error('Error unenrolling from course:', err);
          alert('Грешка при отписване от курса. Моля, опитайте отново.');
        }
      });
    }
  }


}
