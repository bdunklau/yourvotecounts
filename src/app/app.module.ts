import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
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
import { RegisterComponent } from './register/register.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './home/home.component';  // https://ng-bootstrap.github.io/#/getting-started
import { AuthService } from './core/auth.service';
import { LogComponent } from './log/log.component';


// came from here:  https://github.com/RaphaelJenni/FirebaseUI-Angular
// const firebaseUiAuthConfig: firebaseui.auth.Config = {
//   signInFlow: 'popup',
//   signInOptions: [
//     firebase.auth.PhoneAuthProvider.PROVIDER_ID
//   ],
//   tosUrl: '<your-tos-link>',
//   privacyPolicyUrl: '<your-privacyPolicyUrl-link>',
//   credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
// };


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserComponent,
    RegisterComponent,
    HomeComponent,
    LogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    FormsModule, ReactiveFormsModule,
    // FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    AngularFireDatabaseModule,
    NgbModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
