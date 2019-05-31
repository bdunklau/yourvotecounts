import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebaseui from 'firebaseui'
import * as firebase from 'firebase/app'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  ui: firebaseui.auth.AuthUI

  constructor(private afAuth: AngularFireAuth) { }

  ngOnInit() {
    console.log("login.component.ts: ngOnInit()")

    // see:  https://www.youtube.com/watch?v=vAX7PyhbU6s
    const uiConfig = {
      signInOptions: [
        firebase.auth.PhoneAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this)
      }
    }

    // starts the firebase ui library
    this.ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(this.afAuth.auth);
    this.ui.start('#firebaseui-auth-container', uiConfig);
  }

  onLoginSuccessful() {

  }

}
