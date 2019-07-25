import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

    constructor(public afs: AngularFirestore,) { }

    getSettings() {
      var retThis = this.afs.collection('config').doc('settings').valueChanges();
      return retThis;
    }


    updateSettings(settings: Settings) {
      return this.afs.collection('config').doc('settings').ref.update(settings);
    }
}
