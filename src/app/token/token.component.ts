import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css']
})
export class TokenComponent implements OnInit {

  tokenValue: string;
  otherStuff: string;

  submitted = false;

  constructor() { }

  ngOnInit() {
  }

  onSubmit() {
    this.submitted = true;
    var tk = 'token: "'+this.tokenValue+'"'
    firebase.auth().signInWithCustomToken(this.tokenValue)
    .then(function(resp) {
      console.log('success: ', resp)
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('[error code: '+errorCode+']');
      console.log('[error message: '+errorMessage+']');
      console.log('token...');
      console.log(tk);
    });
  }

}
