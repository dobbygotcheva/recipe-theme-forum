import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { Theme } from 'src/app/shared/interfaces/theme';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-edit-theme',
  templateUrl: './edit-theme.component.html',
  styleUrls: ['./edit-theme.component.scss']
})
export class EditThemeComponent implements OnInit{
  theme: Theme | undefined;
  constructor(private apiService: ApiService, private router: Router, private userService: UserService, private activatedRoute: ActivatedRoute) { }

  get isLogged(): boolean {
    return this.userService.isLogged;
  }
  get isOwner(): boolean {
    return this.userService.user?._id === this.theme?.userId;
  }
  categories: string[] = ['Закуски и тестени', 'Салати', 'Супички', 'Основни с месо', 'Основни без месо', 'Десерти', 'Напитки'];
  ngOnInit(): void {
    this.fetchTheme()
  }
  userId = this.userService.user?._id;
  themeId = this.activatedRoute.snapshot.params['themeId'] 
  fetchTheme(): void {

    this.apiService.getTheme(this.themeId).subscribe((theme) => {

      this.theme = theme;

    });
  }
  editThemeHandler(form: NgForm): void {

    if (form.invalid) {
      return;
    }
   
       // title, category, img,time,ingredients,  text,
    const { title, category, img, time, ingredients, text } = form.value;
    const themeId = this.activatedRoute.snapshot.params['themeId'];
    this.apiService.editTheme(themeId, title, category, img, time, ingredients, text, this.userId!).subscribe(() => {
      this.router.navigate([`/themes/${this.themeId}`])
    })


  }
}
