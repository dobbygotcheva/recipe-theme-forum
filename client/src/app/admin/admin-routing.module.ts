import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { ContactManagementComponent } from './contact-management/contact-management.component';
import { CourseScheduleManagementComponent } from './course-schedule-management/course-schedule-management.component';
import { LotteryManagementComponent } from './lottery-management/lottery-management.component';
import { NewsManagementComponent } from './news-management/news-management.component';
import { ThemeModerationComponent } from './theme-moderation/theme-moderation.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    component: AdminProfileComponent,
    data: {
      title: 'Админ профил'
    }
  },
  {
    path: 'lottery',
    component: LotteryManagementComponent,
    data: {
      title: 'Управление на Томболата'
    }
  },
  {
    path: 'contact',
    component: ContactManagementComponent,
    data: {
      title: 'Управление на контактни съобщения'
    }
  },
  {
    path: 'news',
    component: NewsManagementComponent,
    data: {
      title: 'Управление на новини'
    }
  },
  {
    path: 'moderation',
    component: ThemeModerationComponent,
    data: {
      title: 'Модерация на теми'
    }
  },
  {
    path: 'users',
    component: UserManagementComponent,
    data: {
      title: 'Управление на потребители'
    }
  },
  {
    path: 'courses',
    component: CourseScheduleManagementComponent,
    data: {
      title: 'Управление на курсове'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
  constructor() {
    console.log('🔧 AdminRoutingModule loaded with routes:', routes);
  }
}
