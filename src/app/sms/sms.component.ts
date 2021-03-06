import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';
import { SmsService } from './sms.service';
import { Settings } from '../settings/settings.model';
import { SettingsService } from '../settings/settings.service';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';


@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.css']
})
export class SmsComponent implements OnInit {

  fromValue: string;
  toValue: string;
  private mediaUrlValue: string;
  smsMessageValue: string;
  private subscription: Subscription
  private settings: Settings;

  constructor(private smsService: SmsService,
              private settingsService: SettingsService) { }

  ngOnInit() {
    this.subscription = this.settingsService.getSettings()
      .subscribe(obj => {
        this.settings = obj as Settings;
        this.fromValue = this.settings.from_sms;
        this.toValue = this.settings.to_sms;
        console.log('ngOnInit():  this.settings = ', this.settings);
      });
  }

  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
  }

  onSubmit(/* not needed    form: NgForm*/) {
    this.smsService.sendSms({from: this.fromValue, to: this.toValue, mediaUrl: this.mediaUrlValue, message: this.smsMessageValue});
  }

}
