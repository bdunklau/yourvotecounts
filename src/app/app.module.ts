import { BrowserModule, Title, TransferState } from '@angular/platform-browser';
import { NgModule, PLATFORM_ID, Inject } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import * as firebase from 'firebase/app'
import * as firebaseui from 'firebaseui'
// currently there is a bug while building the app with --prod
// - https://github.com/RaphaelJenni/FirebaseUI-Angular/issues/76
// the plugin exposes the two libraries as well. You can use those:
import {FirebaseUIModule/*, firebase, firebaseui*/} from 'firebaseui-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/#/getting-started
import { HomeComponent } from './home/home.component';
import { AuthService } from './core/auth.service';
import { LogComponent } from './log/log.component';
import { UsersComponent } from './users/users.component';
import { HttpClientModule } from '@angular/common/http';
import { TokenComponent } from './token/token.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { SearchUserByPhoneComponent } from './search/search-user-by-phone/search-user-by-phone.component';
import { SearchUserByNameComponent } from './search/search-user-by-name/search-user-by-name.component';
import { SearchLogByLevelComponent } from './search/search-log-by-level/search-log-by-level.component';
import { DateChooserComponent } from './util/date-chooser/date-chooser.component';
import { TeamsComponent } from './teams/teams.component';
import { TeamComponent } from './team/team.component';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamEditorComponent } from './team-editor/team-editor.component';
import { NgbdModalConfirmComponent } from './util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { TeamMemberEditorComponent } from './team-member-editor/team-member-editor.component';
import { SearchUserByName2Component } from './search/search-user-by-name2/search-user-by-name2.component';
import { TeamViewerComponent } from './team-viewer/team-viewer.component';
import { LogFormComponent } from './log/log-form/log-form.component';
import { DisabledComponent } from './disabled/disabled.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollableDirective } from './scrollable.directive';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { MinimalAccountInfoComponent } from './my-account/minimal-account-info/minimal-account-info.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { SmsComponent } from './sms/sms.component';
import { RoundProgressModule }  from 'angular-svg-round-progressbar';
import { PhonePipe } from './util/phone/phone.pipe';
import { InvitationsComponent } from './invitation/invitations/invitations.component';
import { InvitationListComponent } from './invitation/invitation-list/invitation-list.component';
import { InvitationFormComponent } from './invitation/invitation-form/invitation-form.component';
import { InvitationDetailsComponent } from './invitation/invitation-details/invitation-details.component';
import { VideoCallComponent } from './video/video-call/video-call.component';
import { ErrorPageComponent } from './util/error-page/error-page.component';
import { ViewVideoComponent } from './video/view-video/view-video.component';
import { SearchOfficialsComponent } from './civic/officials/search-officials/search-officials.component';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ViewOfficialComponent } from './civic/officials/view-official/view-official.component';
import { ClipboardModule } from 'ngx-clipboard';
import { InvitationDeletedComponent } from './invitation/invitation-deleted/invitation-deleted.component';
import { VideoCallCompleteComponent } from './video/video-call-complete/video-call-complete.component';
import { VideoProducingComponent } from './video/video-producing/video-producing.component';
import { PromoCodeComponent } from './promo-code/promo-code.component';
import { SettingsComponent } from './settings/settings.component';
import { TwilioSettingsComponent } from './settings/twilio-settings/twilio-settings.component';
import { RecordingIndicatorComponent } from './video/recording-indicator/recording-indicator.component';
import { TimerComponent } from './video/timer/timer.component';
import { ElapsedTimePipe } from './util/elapsed-time/elapsed-time.pipe';
import { BannerAdComponent } from './ad/banner-ad/banner-ad.component';
import { MyVideosComponent } from './video/my-videos/my-videos.component';
import { ReviewSmsComponent } from './sms/review-sms/review-sms.component';
import { SmsMainComponent } from './sms/sms-main/sms-main.component';
import { SettingsService } from './settings/settings.service';
import { isPlatformBrowser } from '@angular/common';
import { VideoListComponent } from './admin/video/video-list/video-list.component';
import { FriendsComponent } from './friend/friends/friends.component';
import { FriendFormComponent } from './friend/friend-form/friend-form.component';
import { FriendListComponent } from './friend/friend-list/friend-list.component';
import { VmMainComponent } from './admin/vm/vm-main/vm-main.component';
import { VmHealthComponent } from './admin/vm/vm-health/vm-health.component';
import { VmService } from './admin/vm/vm.service';
import { CommentsComponent } from './comments/comments/comments.component';
import { CommentFormComponent } from './comments/comment-form/comment-form.component';
import { CommentListComponent } from './comments/comment-list/comment-list.component';
import { LinkifyPipe } from './util/linkify/linkify.pipe';
import { BrowserCheckComponent } from './util/browser-check/browser-check.component';
import { TagFormComponent } from './tag/tag-form/tag-form.component';
import { TagListComponent } from './tag/tag-list/tag-list.component';
import { TagsComponent } from './tag/tags/tags.component';
import { MatChipsModule } from '@angular/material/chips'
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { TagEditorComponent } from './tag/tag-editor/tag-editor.component';
import { TrendingComponent } from './trending/trending.component';
import { VideoSearchComponent } from './video/video-search/video-search.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { VideoCallNotAllowedComponent } from './video/video-call-not-allowed/video-call-not-allowed.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { CommitteesComponent } from './civic/committees/committees.component';
import { CommitteeListComponent } from './civic/committee-list/committee-list.component';
import { TeamVideosComponent } from './team-videos/team-videos.component';
import { LicenseeFormComponent } from './license/licensee-form/licensee-form.component';
import { LicenseeMgmtComponent } from './license/licensee-mgmt/licensee-mgmt.component';
import { LicenseeContactFormComponent } from './license/licensee-contact-form/licensee-contact-form.component';
import { LicenseeContactListComponent } from './license/licensee-contact-list/licensee-contact-list.component';
import { LicenseeListComponent } from './license/licensee-list/licensee-list.component';
import { VideoGuestEditorComponent } from './video/video-guest-editor/video-guest-editor.component';



const ORIGINAL_NOT_USED_firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    {
      scopes: [
        'public_profile',
        'email',
        'user_likes',
        'user_friends'
      ],
      customParameters: {
        'auth_type': 'reauthenticate'
      },
      provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID
    },
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    {
      requireDisplayName: false,
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
    },
    firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  tosUrl: '/terms',
  privacyPolicyUrl: '/privacy',
  credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
};


const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  tosUrl: '/terms',
  privacyPolicyUrl: '/privacy',
  credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
};


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    LogComponent,
    UsersComponent,
    TokenComponent,
    MyAccountComponent,
    SearchUserByPhoneComponent,
    SearchUserByNameComponent,
    SearchLogByLevelComponent,
    DateChooserComponent,
    TeamsComponent,
    TeamComponent,
    TeamListComponent,
    TeamEditorComponent,
    NgbdModalConfirmComponent,
    TeamMemberEditorComponent,
    SearchUserByName2Component,
    TeamViewerComponent,
    LogFormComponent,
    DisabledComponent,
    ScrollableDirective,
    LoadingSpinnerComponent,
    MinimalAccountInfoComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    SmsComponent,
    PhonePipe,
    InvitationsComponent,
    InvitationListComponent,
    InvitationFormComponent,
    InvitationDetailsComponent,
    VideoCallComponent,
    ErrorPageComponent,
    ViewVideoComponent,
    SearchOfficialsComponent,
    ViewOfficialComponent,
    InvitationDeletedComponent,
    VideoCallCompleteComponent,
    VideoProducingComponent,
    PromoCodeComponent,
    SettingsComponent,
    TwilioSettingsComponent,
    RecordingIndicatorComponent,
    TimerComponent,
    ElapsedTimePipe,
    BannerAdComponent,
    MyVideosComponent,
    ReviewSmsComponent,
    SmsMainComponent,
    VideoListComponent,
    FriendsComponent,
    FriendFormComponent,
    FriendListComponent,
    VmMainComponent,
    VmHealthComponent,
    CommentsComponent,
    CommentFormComponent,
    CommentListComponent,
    LinkifyPipe,
    BrowserCheckComponent,
    TagFormComponent,
    TagListComponent,
    TagsComponent,
    TagEditorComponent,
    TrendingComponent,
    VideoSearchComponent,
    VideoCallNotAllowedComponent,
    GetStartedComponent,
    CommitteesComponent,
    CommitteeListComponent,
    TeamVideosComponent,
    LicenseeFormComponent,
    LicenseeMgmtComponent,
    LicenseeContactFormComponent,
    LicenseeContactListComponent,
    LicenseeListComponent,
    VideoGuestEditorComponent,
    // FileSelectDirective,
  ],
  entryComponents: [NgbdModalConfirmComponent], // https://stackoverflow.com/a/39376857
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    //AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    FormsModule, ReactiveFormsModule,
    NgbModule, //.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
    AngularFireStorageModule,
    RoundProgressModule,
    GooglePlaceModule,
    MatButtonToggleModule,
    ClipboardModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    Title,
    TransferState,
    ReCaptchaV3Service
    , {provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LdddIUaAAAAAC7IlHEIRyhyoiUESJEOTvlOo5-5'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

    constructor(private settingsService: SettingsService,
        private vmService: VmService,
        @Inject(PLATFORM_ID) private platformId,) {

          
        if(isPlatformBrowser(this.platformId)) {
            //console.log('AppModule(): this.settingsService = ', this.settingsService)
            this.settingsService.getSettingsDoc().then(settings => {
                //console.log('AppModule(): settings = ', settings)
                if(window && window.console) {
                    if(!settings.console_logging) {
                        // console.log('SET CONSOLE LOGGING: OFF')  // don't even echo this
                        window.console.log = function() {}
                    } else {
                        console.log('SET CONSOLE LOGGING: ON')                   
                    }
                }
            })
            this.vmService.monitorVm()
        }



    }

}

