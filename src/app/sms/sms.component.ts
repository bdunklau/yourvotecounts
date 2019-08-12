import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.css']
})
export class SmsComponent implements OnInit {

  private smsValue: string;
  private smsMessageValue: string;

  constructor(private smsService: SmsService) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    this.smsService.sendSms(this.smsValue, this.smsMessageValue);
  }

}
