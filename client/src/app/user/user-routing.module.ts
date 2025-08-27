import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";
import { AuthActivate } from "../shared/guards/auth.activate";


const routes: Routes = [
    {
      path: 'login',
       component: LoginComponent,
      data:{
        title: 'Влез в профила си',
        
      },
      // canActivate:[AuthActivate]
    },
    {
      path: 'register',
     
      component: RegisterComponent,
      data:{
        title: 'Регистрирай се'
      },
      // canActivate:[AuthActivate]
    },
    {
      path: 'profile',
     
      component: ProfileComponent,
      data:{
        title: 'Твоя профил'
      },
      canActivate:[AuthActivate]
    },
   
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class UserRoutingModule { }
  