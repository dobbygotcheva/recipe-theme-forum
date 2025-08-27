import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ArticleDetailComponent } from './article-detail.component';
import { AuthLoginComponent } from './auth-login.component';
import { AuthRegisterComponent } from './auth-register.component';
import { ContactHistoryComponent } from './contact/contact-history.component';
import { ContactComponent } from './contact/contact.component';
import { ErrorComponent } from './core/error/error.component';
import { HomeComponent } from './core/home/home.component';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';
import { SearchComponent } from './core/search/search.component';
import { CoursesComponent } from './courses/courses.component';
import { CreateRecipeSimpleComponent } from './create-recipe-simple.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { NewsComponent } from './news/news.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { RecipeDetailComponent } from './recipe-detail.component';
import { PublicProfileComponent } from './shared/components/public-profile/public-profile.component';
import { SimpleLoginComponent } from './simple-login.component';
import { ThemeListComponent } from './theme-list/theme-list.component';
import { UserProfileSimpleComponent } from './user-profile-simple.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    data: {
      title: 'Начало'
    }
  },
  {
    path: 'themes',
    component: ThemeListComponent,
    data: {
      title: 'Рецепти'
    }
  },
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    data: {
      title: 'Потребители'
    }
  },
  {
    path: 'theme',
    loadChildren: () => import('./theme/theme.module').then(m => m.ThemeModule),
    data: {
      title: 'Рецепти'
    }
  },
  {
    path: 'error',
    component: ErrorComponent,
    data: {
      title: 'Грешка'
    }
  },
  {
    path: 'search',
    component: SearchComponent,
    data: {
      title: 'Търсене'
    }
  },
  {
    path: 'news',
    component: NewsComponent,
    data: {
      title: 'Актуално'
    }
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    data: {
      title: 'Notifications'
    }
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    data: {
      title: 'Любими рецепти'
    }
  },
  {
    path: 'profile',
    component: UserProfileSimpleComponent,
    data: {
      title: 'Моят профил'
    }
  },
  {
    path: 'user/:id',
    component: PublicProfileComponent,
    data: {
      title: 'Потребителски профил'
    }
  },
  {
    path: 'theme/:id',
    component: RecipeDetailComponent,
    data: {
      title: 'Рецепта'
    }
  },
  {
    path: 'article/:id',
    component: ArticleDetailComponent,
    data: {
      title: 'Статия'
    }
  },
  {
    path: 'auth/login',
    component: AuthLoginComponent,
    data: {
      title: 'Вход'
    }
  },
  {
    path: 'auth/register',
    component: AuthRegisterComponent,
    data: {
      title: 'Регистрация'
    }
  },

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    data: {
      title: 'Админ'
    }
  },


  {
    path: 'login',
    component: SimpleLoginComponent,
    data: {
      title: 'Вход'
    }
  },
  {
    path: 'create-recipe',
    component: CreateRecipeSimpleComponent,
    data: {
      title: 'Създай рецепта'
    }
  },
  {
    path: 'courses',
    component: CoursesComponent,
    data: {
      title: 'Курсове по готвене'
    }
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      title: 'Контакт'
    }
  },
  {
    path: 'contact/history',
    component: ContactHistoryComponent,
    data: {
      title: 'История на съобщенията'
    }
  },
  {
    path: 'not-found',
    component: PageNotFoundComponent,
    data: {
      title: 'Страницата не е намерена'
    }
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }