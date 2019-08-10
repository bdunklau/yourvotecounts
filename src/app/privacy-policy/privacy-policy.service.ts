import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class PrivacyPolicyService {

  constructor(private afs: AngularFirestore,) { }

  async getPolicy() {
    var ppDoc = await this.afs.collection('config').doc('privacy_policy').ref.get();
    return ppDoc.data().text;
  }

  updatePolicy(pp: string) {
    this.afs.collection('config').doc('privacy_policy')
      .update({text: pp,
               date: firebase.firestore.FieldValue.serverTimestamp(),
               date_ms: new Date().getTime()});
  }
}
