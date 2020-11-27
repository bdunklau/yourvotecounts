import { Component, OnInit } from '@angular/core';
import { SmsService } from '../sms.service';


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

    constructor(private smsService: SmsService) { }

    async ngOnInit() {
        this.smsMessages = await this.smsService.reviewSms();
    }

}
