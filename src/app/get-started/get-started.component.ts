import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { SettingsService } from '../settings/settings.service';
import { isPlatformBrowser } from '@angular/common';
import { Settings } from '../settings/settings.model';



/**
 * ng g c get-started --module app
 */
@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.css']
})
export class GetStartedComponent implements OnInit {

    // user?: FirebaseUserModel
    settings?: Settings
    headsUpNumber: string
    smsUrl: string 


    constructor(
      private settingsService: SettingsService,     
      @Inject(PLATFORM_ID) private platformId) { }

    async ngOnInit() {
        let isBrowser = isPlatformBrowser(this.platformId)
        if(!isBrowser) return

        this.settings = await this.settingsService.getSettingsDoc()
        this.headsUpNumber = this.settings.from_sms
        this.smsUrl = "sms://"+this.headsUpNumber+";?&body=START";
    }

}
