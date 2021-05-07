import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { LicenseService } from '../license.service';
import { isPlatformBrowser } from '@angular/common';
import { Licensee } from '../licensee/licensee.model';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageService } from 'src/app/core/message.service';

@Component({
  selector: 'app-licensee-list',
  templateUrl: './licensee-list.component.html',
  styleUrls: ['./licensee-list.component.css']
})
export class LicenseeListComponent implements OnInit {

    licensees: Licensee[]
    licenseeSubscription: Subscription

    constructor(private licenseService: LicenseService,  
      private messageService: MessageService,    
      @Inject(PLATFORM_ID) private platformId) { }

    ngOnInit(): void {
        if(isPlatformBrowser(this.platformId)) {
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
                // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
                this.licensees = objs
                // this.licensees = _.map(objs, obj => {
                //   let tm = obj as unknown;
                //   return tm as TeamMember;
                // })
            });

        }
    }


    licenseeSelected(licensee: Licensee) {
        let lic = new Licensee(licensee.toObj())
        this.messageService.setCurrentLicensee(lic)
    }

}
