import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
// import * as firebaseui from 'firebaseui'
// import { firebase} from 'firebase/app'
import {firebase, firebaseui} from 'firebaseui-angular'
import {BehaviorSubject} from 'rxjs';
import { LogService } from '../log/log.service'
import { UserService } from '../user/user.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  ui: firebaseui.auth.AuthUI

  constructor(private afAuth: AngularFireAuth,
              private log: LogService,
              private userService: UserService) { }

  ngOnInit() {
    console.log("login.component.ts: ngOnInit()")

    // see:  https://www.youtube.com/watch?v=vAX7PyhbU6s
    const uiConfig = {
      signInOptions: [
        firebase.auth.PhoneAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this)
      },
    }

    // starts the firebase ui library
    this.ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(this.afAuth.auth);
    this.ui.start('#firebaseui-auth-container', uiConfig);
  }

  onLoginSuccessful() {
    console.log("onLoginSuccessful()");
    var user = firebase.auth().currentUser;
    if(user){
      this.log.i('login');
      this.userService.setFirebaseUser(user);
    }
  }


}
