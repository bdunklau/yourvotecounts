import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/auth.guard';
import { RoleGuard } from './core/role.guard';
import { AuthService } from './core/auth.service';
import { UserComponent } from './user/user.component';
import { UserResolver } from './user/user.resolver';
import { UserService } from './user/user.service';
// import { RegisterGuard } from './register/register.guard';
import { HomeComponent } from './home/home.component';
import { LogComponent } from './log/log.component';
import { UsersComponent } from './users/users.component';
import { TokenComponent } from './token/token.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { TeamsComponent } from './teams/teams.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'log', component: LogComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'admin'} },
  { path: 'login', component: LoginComponent },
  { path: 'myaccount', component: MyAccountComponent, canActivate: [AuthGuard] },
  { path: 'teams', component: TeamsComponent, canActivate: [AuthGuard] },
  { path: 'token', component: TokenComponent },
  // TODO add guard on this route
  { path: 'user', component: UserComponent,  resolve: { data: UserResolver}},
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'admin'} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    AuthService,
    // RegisterGuard,
    UserService,
    UserResolver
  ]
})
export class AppRoutingModule { }
