import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { SmsService } from '../sms.service';
import { isPlatformBrowser } from '@angular/common';


/**
 * ng g c sms/review-sms --module app
 */
@Component({
  selector: 'app-review-sms',
  templateUrl: './review-sms.component.html',
  styleUrls: ['./review-sms.component.css']
})
export class ReviewSmsComponent implements OnInit {

    smsMessages: any[]

    constructor(private smsService: SmsService,
      @Inject(PLATFORM_ID) private platformId,) { }

    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
            this.smsMessages = await this.smsService.reviewSms();
        }
    }

}
