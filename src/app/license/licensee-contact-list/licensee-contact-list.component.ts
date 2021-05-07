import { Component, OnInit, OnDestroy, Input, Inject, PLATFORM_ID } from '@angular/core';
import { LicenseService } from '../license.service';
import { isPlatformBrowser } from '@angular/common';
import { LicenseeContact } from '../licensee-contact/licensee-contact.model';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Licensee } from '../licensee/licensee.model';
import { MessageService } from 'src/app/core/message.service';

@Component({
  selector: 'app-licensee-contact-list',
  templateUrl: './licensee-contact-list.component.html',
  styleUrls: ['./licensee-contact-list.component.css']
})
export class LicenseeContactListComponent implements OnInit {

    @Input() inputLicensee: Licensee
    licenseeContacts: LicenseeContact[]
    licenseeContactSubscription: Subscription
    licenseeListener: Subscription

    constructor(private licenseService: LicenseService,   
            private messageService: MessageService,
            @Inject(PLATFORM_ID) private platformId) { }

    ngOnInit(): void {
        if(isPlatformBrowser(this.platformId)) {
            this.xxxx()
            
            let yyyy = function(licensee) { 
                if(this.licenseeContactSubscription) this.licenseeContactSubscription.unsubscribe()
                this.inputLicensee = licensee
                this.xxxx()
            }.bind(this)

            this.licenseeListener = this.messageService.listenForLicensee().subscribe({
                next: yyyy,
                error: () => {}, 
                complete: () => {}
            })
        }
    }


    xxxx() {
        this.licenseeContactSubscription = this.licenseService.getLicenseeContacts(this.inputLicensee).pipe(
            map(actions => {
                return actions.map(a => {
                    /**
                     * YOU CAN'T JUST CAST a.payload.doc.data() as Licensee
                     * because Licensee as a toObj() function that we want
                     * 
                     * You have to pass a.payload.doc.data() to the Licensee constructor
                     */
                    let licenseeContact = new LicenseeContact(a.payload.doc.data())
                    return licenseeContact;
                });
            })
        )
        .subscribe((objs:LicenseeContact[]) => {
            this.licenseeContacts = objs
        });
    }


    ngOnDestroy() {
        if(this.licenseeContactSubscription) this.licenseeContactSubscription.unsubscribe()
    }


    licenseeContactSelected(licenseeContact: LicenseeContact) {
        console.log('licenseeContactSelected: ', licenseeContact)
        this.messageService.setCurrentLicenseeContact(licenseeContact)
    }

}
