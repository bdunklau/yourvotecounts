import { Component, OnInit } from '@angular/core';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';
import { SmsService } from './sms.service';
declare const Twilio: any; //ref:  https://stackoverflow.com/questions/40480191/how-to-use-twilio-client-in-angular-2/40491382#40491382
// import { Client, User } from "twilio-chat";

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.css']
})
export class SmsComponent implements OnInit {

  private smsValue: string;
  private smsMessageValue: string;
  private twilioClient: Client

  constructor(private smsService: SmsService) { }

  ngOnInit() {
    var token = '45b0388a12208ae688c194ead32cdd7b';
    console.log('Twilio = ', Twilio);
    Twilio.Chat.Client.create(token).then(client => {
        console.log('client = ', client);
        this.twilioClient = client;
    });
  }

  onSubmit(form: NgForm) {
    this.smsService.sendSms({number: this.smsValue, message: this.smsMessageValue});
  }

}




// curl 'https://api.twilio.com/2010-04-01/Accounts/AC39eb73665d3f73464e7e7d8f5be2e5ba/Messages.json' -X POST \
// --data-urlencode 'To=+12146325613' \
// --data-urlencode 'From=+18174094501' \
// -u AC39eb73665d3f73464e7e7d8f5be2e5ba:45b0388a12208ae688c194ead32cdd7b
