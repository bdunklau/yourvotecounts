import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class SmsService {

  constructor(public afs: AngularFirestore) { }

  sendSms(args: {from: string, to: string, media: string, message: string}) {
    // Write to the sms collection
    var doc = {}
    doc['from'] = args.from;
    doc['to'] = args.to;
    if(args.mediaUrl) doc['mediaUrl'] = args.mediaUrl;
    doc['message'] = args.message;
    doc['date'] = firebase.firestore.Timestamp.now().toDate();
    doc['date_ms'] = firebase.firestore.Timestamp.now().toMillis();
    this.afs.collection('sms').add(doc);
  }
}
