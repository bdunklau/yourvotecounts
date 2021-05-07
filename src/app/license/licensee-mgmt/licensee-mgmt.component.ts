import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { MessageService } from 'src/app/core/message.service';
import { Subscription } from 'rxjs';
import { Licensee } from '../licensee/licensee.model';
import { LicenseService } from '../license.service';
import { isPlatformBrowser } from '@angular/common';


/**
 * ng g c license/licensee-mgmt --module=app
 */
@Component({
  selector: 'app-licensee-mgmt',
  templateUrl: './licensee-mgmt.component.html',
  styleUrls: ['./licensee-mgmt.component.css']
})
export class LicenseeMgmtComponent implements OnInit {

    licenseeListener: Subscription
    licensee: Licensee


    constructor(private messageService: MessageService, 
        private licenseService: LicenseService, 
        @Inject(PLATFORM_ID) private platformId) { }

    
  
      ngOnInit(): void {
          if(isPlatformBrowser(this.platformId)) {
                let setLicensee = function(licensee) { 
                    this.licensee = licensee
                }.bind(this)
        
                this.licenseeListener = this.messageService.listenForLicensee().subscribe({
                    next: setLicensee,
                    error: () => {}, 
                    complete: () => {}
                })
          }
      }


    ngOnDestroy() {
        if(this.licenseeListener) this.licenseeListener.unsubscribe()
    }

}
