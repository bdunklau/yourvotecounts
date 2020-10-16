import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../settings.service';
import { TwilioSettings } from './twilio-settings.model'

@Component({
  selector: 'app-twilio-settings',
  templateUrl: './twilio-settings.component.html',
  styleUrls: ['./twilio-settings.component.css']
})
export class TwilioSettingsComponent implements OnInit {


    twilioSettings: TwilioSettings


    constructor(private settingsService: SettingsService) { }

    async ngOnInit() {
        this.twilioSettings = await this.settingsService.getTwilioSettingsDoc();
    }


    doit() {

    }


    onSubmit() {
        this.settingsService.updateTwilioSettings(this.twilioSettings)
    }

}
