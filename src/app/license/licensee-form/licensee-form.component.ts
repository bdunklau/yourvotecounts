import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { UserService } from 'src/app/user/user.service';
import { Licensee } from '../licensee/licensee.model';
import { LicenseService } from '../license.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { isPlatformBrowser } from '@angular/common';
import { MessageService } from 'src/app/core/message.service';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';


/**
 * ng g c license/licensee-form --module=app
 */
@Component({
  selector: 'app-licensee-form',
  templateUrl: './licensee-form.component.html',
  styleUrls: ['./licensee-form.component.css']
})
export class LicenseeFormComponent implements OnInit {

    licensee:Licensee = new Licensee()
    licenseeName: string
    // expiration_ms: number
    expiration
    number_of_teams = 1 // just a default value
    licenseeListener: Subscription
    // fromValue: string;
    // toValue: string;
    // private mediaUrlValue: string;
    // smsMessageValue: string;
    // private subscription: Subscription
    // private settings: Settings;

    constructor(private userService: UserService,
                private licenseService: LicenseService,  
                private messageService: MessageService,
                @Inject(PLATFORM_ID) private platformId,
                /* private settingsService: SettingsService */) { }

    ngOnInit() {
        // this.subscription = this.settingsService.getSettings()
        //   .subscribe(obj => {
        //     this.settings = obj as Settings;
        //     this.fromValue = this.settings.from_sms;
        //     this.toValue = this.settings.to_sms;
        //     console.log('ngOnInit():  this.settings = ', this.settings);
        //   });
        if(isPlatformBrowser(this.platformId)) {
            let setLicensee = function(licensee) { 
                this.licensee = licensee
                this.expiration = new Date(this.licensee.expiration_ms)
            }.bind(this)
    
            this.licenseeListener = this.messageService.listenForLicensee().subscribe({
                next: setLicensee,
                error: () => {}, 
                complete: () => {}
            })

        }
    }


    ngOnDestroy() {
      // if(this.subscription) this.subscription.unsubscribe();
    }
    

    /**
     * see also   users.component.ts
     */
    captureDate(type: string, event: MatDatepickerInputEvent<Date>) {
      if(event.value.getTime()) {
          // this.expiration = new Date(event.value.getTime() + 24 * 60 * 60 * 1000 - 1000) // 11:59:59pm
          this.licensee.expiration_ms = new Date(event.value.getTime() + 24 * 60 * 60 * 1000 - 1000).getTime() // 11:59:59pm
      }
    }


    onSubmit(/* not needed    form: NgForm*/) {
        /**
         * see also   users.component.ts
         */
        // this.licensee.expiration_ms = this.expiration.getTime()
        // this.licensee.name = this.licenseeName
        // this.licensee.number_of_teams = this.number_of_teams
        console.log('try to save: ', this.licensee)
        this.licenseService.saveLicensee(this.licensee)
      // this.smsService.sendSms({from: this.fromValue, to: this.toValue, mediaUrl: this.mediaUrlValue, message: this.smsMessageValue});
    }


    cancelLicenseeForm(form: NgForm) {
        form.reset()
        this.messageService.setCurrentLicensee(new Licensee())
    }

}
