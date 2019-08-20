import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class TermsOfServiceService {

  constructor(private afs: AngularFirestore,) { }

  async getTerms() {
    var termsDoc = await this.afs.collection('config').doc('terms_of_service').ref.get();
    return termsDoc.data().text;
  }

  updateTerms(terms: string) {
    this.afs.collection('config').doc('terms_of_service')
      .update({text: terms,
               date: firebase.firestore.FieldValue.serverTimestamp(),
               date_ms: new Date().getTime()});
  }
}
