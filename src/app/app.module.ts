import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// currently there is a bug while building the app with --prod
// - https://github.com/RaphaelJenni/FirebaseUI-Angular/issues/76
// the plugin exposes the two libraries as well. You can use those:
import {FirebaseUIModule, firebase, firebaseui} from 'firebaseui-angular';
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


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserComponent,
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
  ],
  entryComponents: [NgbdModalConfirmComponent], // https://stackoverflow.com/a/39376857
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    FormsModule, ReactiveFormsModule,
    NgbModule.forRoot(),
    HttpClientModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
