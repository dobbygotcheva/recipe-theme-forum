import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ArticleDetailComponent } from './article-detail.component';
import { AuthLoginComponent } from './auth-login.component';
import { AuthRegisterComponent } from './auth-register.component';
import { ContactHistoryComponent } from './contact/contact-history.component';
import { ContactComponent } from './contact/contact.component';
import { CoreModule } from './core/core.module';
import { SearchComponent } from './core/search/search.component';
import { CoursesComponent } from './courses/courses.component';
import { CreateRecipeSimpleComponent } from './create-recipe-simple.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { HomePageComponent } from './home-page.component';
import { NewsPageComponent } from './news-page.component';
import { NewsComponent } from './news/news.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { RecipeDetailComponent } from './recipe-detail.component';
import { PublicProfileComponent } from './shared/components/public-profile/public-profile.component';
import { LotteryService } from './shared/services/lottery.service';
import { SharedModule } from './shared/shared.module';
import { SimpleLoginComponent } from './simple-login.component';
import { ThemeListModule } from './theme-list/theme-list.module';
import { ThemesPageComponent } from './themes-page.component';
import { UserProfileSimpleComponent } from './user-profile-simple.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    ThemesPageComponent,
    NewsPageComponent,
    RecipeDetailComponent,
    ArticleDetailComponent,
    UserProfileSimpleComponent,
    PublicProfileComponent,
    SearchComponent,
    SimpleLoginComponent,
    CreateRecipeSimpleComponent,
    AuthLoginComponent,
    AuthRegisterComponent,
    FavoritesComponent,
    CoursesComponent,
    NewsComponent,
    NotificationsComponent,
    ContactHistoryComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CoreModule,
    AppRoutingModule,
    ThemeListModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: class {
        intercept(req: any, next: any) {
          req.withCredentials = true;
          return next.handle(req);
        }
      },
      multi: true
    },
    LotteryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }






