import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

import { FavoritesDisplayComponent } from './components/favorites-display/favorites-display.component';
import { NotificationDropdownComponent } from './components/notification-dropdown/notification-dropdown.component';
import { ProfileManagementComponent } from './components/profile-management/profile-management.component';
import { RecipeManagementComponent } from './components/recipe-management/recipe-management.component';
import { LotteryDisplayComponent } from './components/lottery-display/lottery-display.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';


import { ListPipe } from './pipes/list.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { Search2Pipe } from './pipes/search2.pipe';
import { SlicePipe } from './pipes/slice.pipe';

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    NotificationDropdownComponent,
    ProfileManagementComponent,
    RecipeManagementComponent,
    FavoritesDisplayComponent,
    LotteryDisplayComponent,
    ListPipe,
    SearchPipe,
    Search2Pipe,
    SlicePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    ConfirmationDialogComponent,
    NotificationDropdownComponent,
    ProfileManagementComponent,
    RecipeManagementComponent,
    FavoritesDisplayComponent,
    LotteryDisplayComponent,
    ListPipe,
    SearchPipe,
    Search2Pipe,
    SlicePipe
  ]
})
export class SharedModule { }
