import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
// import * as firebaseui from 'firebaseui'
// import { firebase} from 'firebase/app'
//import {firebase, firebaseui} from 'firebaseui-angular'
import { BehaviorSubject, of } from 'rxjs';
import { LogService } from '../log/log.service'
import { UserService } from '../user/user.service'
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  ui: firebaseui.auth.AuthUI

  constructor(private afAuth: AngularFireAuth,
              private log: LogService,
              private router: Router,
              @Inject(PLATFORM_ID) private platformId,
              private userService: UserService) { }

  async ngOnInit() {
    console.log("login.component.ts: ngOnInit()")

    if(isPlatformBrowser(this.platformId)) {
        let firebase = await import('firebase')
        let firebaseui = await import('firebaseui')
        console.log('firebaseui = ', firebaseui)



        
        let onLoginSuccessful = function() {
          console.log("onLoginSuccessful()");
          var user = firebase.auth().currentUser;
          if(user){
            // this.log.i('login');
            // this.userService.setFirebaseUser(user);
            this.userService.signIn(this.log, user);
            this.router.navigate(['/home'])
          }
        }

        console.log('ah ha!!')


        // see:  https://www.youtube.com/watch?v=vAX7PyhbU6s
        const uiConfig = {
          signInOptions: [
              firebase.auth.PhoneAuthProvider.PROVIDER_ID
          ],
          callbacks: {
              signInSuccessWithAuthResult: /*this.*/onLoginSuccessful.bind(this)
          },
        }

        // starts the firebase ui library
        this.ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(this.afAuth.auth);
        this.ui.start('#firebaseui-auth-container', uiConfig);
      


    }

  }


  // onLoginSuccessful() {
  //   console.log("onLoginSuccessful()");
  //   var user = firebase.auth().currentUser;
  //   if(user){
  //     // this.log.i('login');
  //     // this.userService.setFirebaseUser(user);
  //     this.userService.signIn(this.log, user);
  //     this.router.navigate(['/home'])
  //   }
  // }


}
