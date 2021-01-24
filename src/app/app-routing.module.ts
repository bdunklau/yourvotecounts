import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/auth.guard';
import { RoleGuard } from './core/role.guard';
import { AuthService } from './core/auth.service';
import { UserResolver } from './user/user.resolver';
import { UserService } from './user/user.service';
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
import { LogFormComponent } from './log/log-form/log-form.component';
import { MinimalAccountInfoGuard } from './my-account/minimal-account-info/minimal-account-info.guard';
import { MinimalAccountInfoComponent } from './my-account/minimal-account-info/minimal-account-info.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { SmsComponent } from './sms/sms.component';
import { InvitationsComponent } from './invitation/invitations/invitations.component';
import { InvitationFormComponent } from './invitation/invitation-form/invitation-form.component';
import { InvitationListComponent } from './invitation/invitation-list/invitation-list.component';
import { InvitationDetailsComponent } from './invitation/invitation-details/invitation-details.component';
import { InvitationResolver } from './invitation/invitation.resolver';
import { VideoCallComponent } from './video/video-call/video-call.component';
import { ValidInvitationGuard } from './invitation/valid-invitation.guard';
import { ErrorPageComponent } from './util/error-page/error-page.component';
import { ViewVideoComponent } from './video/view-video/view-video.component';
import { VideoReadyGuard } from './video/video-ready/video-ready.guard';
import { SearchOfficialsComponent } from './civic/officials/search-officials/search-officials.component'
import { SearchOfficialsGuard } from './civic/officials/search-officials/search-officials.guard'
import { SettingsGuard } from './settings/settings.guard'
import { InvitationDeletedComponent } from './invitation/invitation-deleted/invitation-deleted.component'
import { VideoCallCompleteComponent } from './video/video-call-complete/video-call-complete.component';
import { VideoCallGuard } from './video/video-call/video-call.guard';
import { VideoCallCompleteGuard } from './video/video-call-complete/video-call-complete.guard';
import { VideoProducingComponent } from './video/video-producing/video-producing.component';
import { VideoProducingGuard } from './video/video-producing/video-producing.guard';
import { PromoCodeComponent } from './promo-code/promo-code.component'
import { InvitationFormGuard } from './invitation/invitation-form/invitation-form.guard';
import { SettingsComponent } from './settings/settings.component';
import { TwilioSettingsComponent } from './settings/twilio-settings/twilio-settings.component';
import { MyVideosComponent } from './video/my-videos/my-videos.component'
import { SmsMainComponent } from './sms/sms-main/sms-main.component';
import { VideoListComponent } from './admin/video/video-list/video-list.component';
import { FriendsComponent } from './friend/friends/friends.component';
import { FriendGuard } from './friend/friend.guard';
import { VmMainComponent } from './admin/vm/vm-main/vm-main.component';
import { VmGuard } from './admin/vm/vm.guard';
import { TagsComponent } from './tag/tags/tags.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'admin/tags', component: TagsComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
  { path: 'admin/videos', component: VideoListComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
  // { path: 'admin/vm', component: VmMainComponent, canActivate: [VmGuard], data: {role: 'admin'} },
  { path: 'disabled', component: DisabledComponent },
  { path: 'error-page', component: ErrorPageComponent },
  { path: 'friends', component: FriendsComponent, canActivate: [FriendGuard] },
  { path: 'home', component: HomeComponent },
  
  { path: 'invitations', component: InvitationsComponent, canActivate: [InvitationFormGuard], resolve: { user: UserResolver} },
  //{ path: 'invitation-details/:invitationId/:phoneNumber', component: InvitationDetailsComponent, canActivate: [DisabledGuard, ValidInvitationGuard] /*, resolve: {invitation: InvitationResolver}*/ },
  { path: 'invitation-deleted', component: InvitationDeletedComponent },
  { path: 'invitation-form', component: InvitationFormComponent, canActivate: [InvitationFormGuard], resolve: { user: UserResolver} },
  { path: 'invitation-list', component: InvitationListComponent, canActivate: [AuthGuard, DisabledGuard, MinimalAccountInfoGuard], resolve: { user: UserResolver} },
  
  
  { path: 'log', component: LogComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard, MinimalAccountInfoGuard], data: {role: 'admin'} },
  { path: 'login', component: LoginComponent },
  { path: 'minimal-account-info', component: MinimalAccountInfoComponent, canActivate: [AuthGuard, DisabledGuard], resolve: { user: UserResolver} },
  { path: 'myaccount', component: MyAccountComponent, canActivate: [AuthGuard, DisabledGuard, MinimalAccountInfoGuard] },
  { path: 'my-videos', component: MyVideosComponent, canActivate: [AuthGuard, DisabledGuard, MinimalAccountInfoGuard] },
  { path: 'privacy', component: PrivacyPolicyComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
  { path: 'promo-code', component: PromoCodeComponent, canActivate: [AuthGuard, DisabledGuard] },
  { path: 'search-officials', component: SearchOfficialsComponent, canActivate: [SearchOfficialsGuard] },
  { path: 'settings/general', component: SettingsComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
  { path: 'settings/twilio', component: TwilioSettingsComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
  { path: 'sms', component: SmsMainComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
  { path: 'teams/add', component: TeamEditorComponent, canActivate: [AuthGuard, DisabledGuard, MinimalAccountInfoGuard], resolve: { user: UserResolver} },
  { path: 'teams/:teamDocId', component: TeamViewerComponent, canActivate: [AuthGuard, DisabledGuard, MinimalAccountInfoGuard], resolve: {team: TeamResolver, user: UserResolver} },
  { path: 'teams/edit/:teamDocId', component: TeamEditorComponent, canActivate: [AuthGuard, DisabledGuard, MinimalAccountInfoGuard], resolve: {team: TeamResolver, user: UserResolver} },
  { path: 'teams', component: TeamsComponent, canActivate: [AuthGuard, DisabledGuard, MinimalAccountInfoGuard] },
  { path: 'terms', component: TermsOfServiceComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard], data: {role: 'admin'} },
  { path: 'test/log', component: LogFormComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard, MinimalAccountInfoGuard], data: {role: 'admin'} },
  { path: 'token', component: TokenComponent },
  // TODO add guard on this route
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard, DisabledGuard, RoleGuard, MinimalAccountInfoGuard], data: {role: 'admin'} },
  { path: 'video-call/:invitationId/:phoneNumber/:dimension', component: VideoCallComponent, canActivate: [VideoCallGuard] /*, resolve: {invitation: InvitationResolver}*/ },
  { path: 'video-call/:invitationId/:phoneNumber', component: VideoCallComponent, canActivate: [VideoCallGuard] /*, resolve: {invitation: InvitationResolver}*/ },
  { path: 'video-call-complete/:RoomSid/:hostOrGuest/:phoneNumber', component: VideoCallCompleteComponent, canActivate: [DisabledGuard, VideoCallCompleteGuard] },
  { path: 'video/producing/:RoomSid', component: VideoProducingComponent, canActivate: [DisabledGuard, VideoProducingGuard] },
  { path: 'view-video/:compositionSid', component: ViewVideoComponent, canActivate: [/*DisabledGuard,*/ SettingsGuard, VideoReadyGuard] },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    AuthService,
    // RegisterGuard,
    UserService,
    UserResolver,
    TeamResolver,
    InvitationResolver
  ]
})
export class AppRoutingModule { }
