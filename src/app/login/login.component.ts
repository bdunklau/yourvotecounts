import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { LogService } from '../log/log.service'
import { UserService } from '../user/user.service'
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseUserModel } from '../user/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  //ui: firebaseui.auth.AuthUI
  private userSubscription: Subscription

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

        /**
         * GOOD REFERENCE:  https://github.com/firebase/firebaseui-web#starting-the-sign-in-flow
         */
        let ui: firebaseui.auth.AuthUI
        
        let onLoginSuccessful = function() {
            var user = firebase.auth().currentUser;       

            // https://headsupvideo.atlassian.net/browse/HEADSUP-59
            this.userSubscription = this.userService.subscribe(user.uid, async (users:[FirebaseUserModel]) => {
                if(users && users.length > 0) {          
                    let auser = users[0]
        
                    if(!auser.tosAccepted && !auser.privacyPolicyRead) {
                      this.router.navigate(['/minimal-account-info'])
                    }
                    else {
                      console.log('LoginComponent: going to /home')
                      this.router.navigate(['/home'])
                    }
        
                }
            })
        }


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

        //   this.ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(this.afAuth.auth);
        // /*this.*/ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(this.afAuth.auth);
        //*this.*/ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(this.afAuth/*.auth*/);
        // /*this.*/ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI({apiKey: "xxxxxx", options: "ssss"}/*this.afAuth*//*.auth*/);
        //*this.*/ui.start('#firebaseui-auth-container', uiConfig);
      

        try {
            // Code throwing an exception
            //ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(this.afAuth);
            ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth()); //@see  https://github.com/firebase/firebaseui-web/issues/216#issuecomment-459302414
            console.log('did we get to ui.start() ????')
            ui.start('#firebaseui-auth-container', uiConfig);
        } catch(e) {
          console.log(e.stack);
        }


    }

  }


  ngOnDestroy() {
      if(this.userSubscription) this.userSubscription.unsubscribe()
  }


}
