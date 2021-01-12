import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  firebase_functions_host = "us-central1-yourvotecounts-dev.cloudfunctions.net"

  constructor(private userService: UserService,
              @Inject(PLATFORM_ID) private platformId,
              private settingsService: SettingsService,
              private log: LogService) { }

  async ngOnInit() {

      /**
       * Have to wrap in this if block so we don't get the "Error enabling offline persistence" error in server console
       */
      if(isPlatformBrowser(this.platformId)) {
          this.settings = await this.settingsService.getSettingsDoc()
          this.firebase_functions_host = this.settings.firebase_functions_host
      }
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
