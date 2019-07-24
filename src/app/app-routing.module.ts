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
import { TeamEditorComponent } from './team-editor/team-editor.component';
import { TeamViewerComponent } from './team-viewer/team-viewer.component';
import { TeamResolver } from './team/team.resolver';
import { DisabledGuard } from './disabled/disabled.guard';
import { DisabledComponent } from './disabled/disabled.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'disabled', component: DisabledComponent },
  { path: 'home', component: HomeComponent },
  { path: 'log', component: LogComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
  { path: 'login', component: LoginComponent },
  { path: 'myaccount', component: MyAccountComponent, canActivate: [AuthGuard, DisabledGuard] },
  { path: 'teams/add', component: TeamEditorComponent, canActivate: [AuthGuard, DisabledGuard], resolve: { user: UserResolver} },
  { path: 'teams/:teamDocId', component: TeamViewerComponent, canActivate: [AuthGuard, DisabledGuard], resolve: {team: TeamResolver, user: UserResolver} },
  { path: 'teams/edit/:teamDocId', component: TeamEditorComponent, canActivate: [AuthGuard, DisabledGuard], resolve: {team: TeamResolver, user: UserResolver} },
  { path: 'teams', component: TeamsComponent, canActivate: [AuthGuard, DisabledGuard] },
  { path: 'token', component: TokenComponent },
  // TODO add guard on this route
  { path: 'user', component: UserComponent,  resolve: { data: UserResolver}},
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    AuthService,
    // RegisterGuard,
    UserService,
    UserResolver,
    TeamResolver
  ]
})
export class AppRoutingModule { }
