import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { AdminRoutingModule } from './admin-routing.module';
import { ContactManagementComponent } from './contact-management/contact-management.component';
import { CourseScheduleManagementComponent } from './course-schedule-management/course-schedule-management.component';
import { LotteryManagementComponent } from './lottery-management/lottery-management.component';
import { NewsManagementComponent } from './news-management/news-management.component';
import { ThemeModerationComponent } from './theme-moderation/theme-moderation.component';
import { UserManagementComponent } from './user-management/user-management.component';

@NgModule({
  declarations: [
    AdminProfileComponent,
    LotteryManagementComponent,
    ContactManagementComponent,
    NewsManagementComponent,
    ThemeModerationComponent,
    UserManagementComponent,
    CourseScheduleManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AdminRoutingModule
  ]
})
export class AdminModule {
  constructor() {
    console.log('🔧 AdminModule loaded');
  }
}
