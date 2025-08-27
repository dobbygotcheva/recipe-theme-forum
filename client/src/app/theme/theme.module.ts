import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewThemeComponent } from './new-theme/new-theme.component';
import { CurrentThemeComponent } from './current-theme/current-theme.component';
import { ThemeRoutingModule } from './theme-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditThemeComponent } from './edit-theme/edit-theme.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    CurrentThemeComponent,
    EditThemeComponent,
    NewThemeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeRoutingModule,
    SharedModule
  ],
  exports:[NewThemeComponent, CurrentThemeComponent]
})
export class ThemeModule { }
