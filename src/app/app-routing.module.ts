import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';
import { UserComponent } from './user/user.component';
import { UserResolver } from './user/user.resolver';
import { UserService } from './core/user.service';
import { RegisterComponent } from './register/register.component';
import { RegisterGuard } from './register/register.guard';
import { HomeComponent } from './home/home.component';
import { LogComponent } from './log/log.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'log', component: LogComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [RegisterGuard] },
  { path: 'user', component: UserComponent,  resolve: { data: UserResolver}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    AuthService,
    RegisterGuard,
    UserService,
    UserResolver
  ]
})
export class AppRoutingModule { }
