import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Settings } from './settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

    constructor(public afs: AngularFirestore,) { }

    getSettings() {
      var retThis = this.afs.collection('config').doc('settings').valueChanges();
      return retThis;
    }


    async getSettingsDoc() {
      var settingsDoc = await this.afs.collection('config').doc('settings').ref.get();
      var settings = settingsDoc.data() as Settings;
      return settings;
    }


    async isDisabled() {
      var settingsDoc = await this.afs.collection('config').doc('settings').ref.get();
      var settings = settingsDoc.data() as Settings;
      return settings.disabled;
    }


    updateSettings(settings: Settings) {
      return this.afs.collection('config').doc('settings').ref.update(settings);
    }
}
