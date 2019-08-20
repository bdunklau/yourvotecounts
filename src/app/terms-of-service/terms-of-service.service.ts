import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class TermsOfServiceService {

  constructor(private afs: AngularFirestore,) { }

  async getTerms() {
    var termsDoc = await this.afs.collection('config').doc('terms_of_service');
    var termsRef = termsDoc.ref;
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    console.log('termsRef: ', termsRef);
    var termsGet = termsRef.get();
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    console.log('termsGet: ', termsGet);
    return termsGet.data().text;
  }

  updateTerms(terms: string) {
    this.afs.collection('config').doc('terms_of_service')
      .update({text: terms,
               date: firebase.firestore.FieldValue.serverTimestamp(),
               date_ms: new Date().getTime()});
  }
}
