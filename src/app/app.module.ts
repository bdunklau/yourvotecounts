import { BrowserModule, Title, TransferState } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
    NgbModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
    AngularFireStorageModule,
    RoundProgressModule,
    GooglePlaceModule,
    MatButtonToggleModule,
    ClipboardModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
  ],
  providers: [
    Title,
    TransferState
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

    constructor() {
        if(window && window.console) {
            if (environment.production) {
                // console.log('production: turning off console.log()')
                window.console.log = function() {}
            }
            else {
                console.log('else not production: -----------------')                
            }
        }
    }

}

