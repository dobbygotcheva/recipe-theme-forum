import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeListComponent } from './theme-list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ThemeListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    ThemeListComponent
  ]
})
export class ThemeListModule { }
