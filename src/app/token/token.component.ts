import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';
import { UserService } from '../user/user.service';
import { LogService } from '../log/log.service'
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../settings/settings.model';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css']
})
export class TokenComponent implements OnInit {

  tokenValue: string;
  otherStuff: string;
  submitted = false;
  settings: Settings

  constructor(private userService: UserService,
              private settingsService: SettingsService,
              private log: LogService) { }

  async ngOnInit() {
      this.settings = await this.settingsService.getSettingsDoc()
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

  }

}
