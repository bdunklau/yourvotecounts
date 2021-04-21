import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { LicenseService } from '../../license/license.service';
import { Licensee } from '../../license/licensee/licensee.model';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.model';



/**
 * ng g c video/video-call-not-allowed --module app
 */
@Component({
  selector: 'app-video-call-not-allowed',
  templateUrl: './video-call-not-allowed.component.html',
  styleUrls: ['./video-call-not-allowed.component.css']
})
export class VideoCallNotAllowedComponent implements OnInit {

    licensees: Licensee[]
    licenseeSubscription: Subscription
    settings: Settings
    admin_phone: string

    constructor(private licenseService: LicenseService,   
      private settingsService: SettingsService,       
      @Inject(PLATFORM_ID) private platformId) { }

    async ngOnInit() {
        
        if(isPlatformBrowser(this.platformId)) {
          
            this.settings = await this.settingsService.getSettingsDoc()
            this.admin_phone = this.settings.admin_sms
            this.licenseeSubscription = this.licenseService.getLicensees().pipe(
                map(actions => {
                    return actions.map(a => {
                        /**
                         * YOU CAN'T JUST CAST a.payload.doc.data() as Licensee
                         * because Licensee as a toObj() function that we want
                         * 
                         * You have to pass a.payload.doc.data() to the Licensee constructor
                         */
                        let licensee = new Licensee(a.payload.doc.data())
                        return licensee;
                    });
                })
            )
            .subscribe(objs => {
                this.licensees = objs
            });

        }
    }

}
