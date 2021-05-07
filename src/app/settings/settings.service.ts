import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Settings } from './settings.model';
import { TwilioSettings } from './twilio-settings/twilio-settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

    keys: Keys
    maxGuests = 3  // don't anticipate needing to change this

    constructor(public afs: AngularFirestore,) { }

    getSettings() {
      var retThis = this.afs.collection('config').doc('settings').valueChanges();
      return retThis;
    }


    async getTwilioSettingsDoc() {
      var twilioSettingsDoc = await this.afs.collection('config').doc('twilio').ref.get();
      var twilioSettings = twilioSettingsDoc.data() as TwilioSettings;
      return twilioSettings;
    }


    async getSettingsDoc() {
      var settingsDoc = await this.afs.collection('config').doc('settings').ref.get();
      var settings = settingsDoc.data() as Settings;
      return settings;
    }


    // lazy - keys and settings are separate docs but we're using this service to get keys too
    async getKeysDoc() {
      var keysDoc = await this.afs.collection('config').doc('keys').ref.get();
      var keys = keysDoc.data() as Keys
      return keys;
    }


    async isDisabled() {
      var settingsDoc = await this.afs.collection('config').doc('settings').ref.get();
      var settings = settingsDoc.data() as Settings;
      return settings.disabled;
    }


    updateSettings(settings: Settings) {
        return this.afs.collection('config').doc('settings').ref.update(settings);
    }

    updateTwilioSettings(settings: TwilioSettings) {
        return this.afs.collection('config').doc('twilio').ref.update(settings);
    }
}

export class Keys {
    civic_information_api_key: string
    // twilio_account_sid: string
    // twilio_api_key: string
    // twilio_auth_key: string
    // twilio_secret: string
}
