import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css']
})
export class TokenComponent implements OnInit {

  tokenValue: string;
  otherStuff: string;

  submitted = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  async onSubmit() {
    this.submitted = true;
    var tk = 'token: "'+this.tokenValue+'"'
    let firebase_auth_user = await firebase.auth().signInWithCustomToken(this.tokenValue)
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('[error code: '+errorCode+']');
      console.log('[error message: '+errorMessage+']');
      console.log('token...');
      console.log(tk);
    });

    if(firebase_auth_user && firebase_auth_user.user) {
      console.log('TokenComponent: firebase_auth_user.user = ', firebase_auth_user.user);
      this.userService.setFirebaseUser(firebase_auth_user.user);
    }

  }

}
