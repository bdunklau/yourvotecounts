import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { UserService } from 'src/app/user/user.service';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseUserModel } from 'src/app/user/user.model';



/**
 * ng g c sms/sms-opt-in --module=app
 */
@Component({
  selector: 'app-sms-opt-in',
  templateUrl: './sms-opt-in.component.html',
  styleUrls: ['./sms-opt-in.component.css']
})
export class SmsOptInComponent implements OnInit {

    user?: FirebaseUserModel

    constructor(private userService: UserService,      
      @Inject(PLATFORM_ID) private platformId) { }

    async ngOnInit() {
        let isBrowser = isPlatformBrowser(this.platformId)
        if(!isBrowser) return

        // this makes the opt-in button appear, other wise this component is not displayed
        this.user = await this.userService.getCurrentUser()
    }

}
