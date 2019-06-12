import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { LogEntry } from './logentry'

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(
    public db: AngularFirestore,) { }

  async d(keyvals) {
    this.logit(keyvals, 'debug')
  }

  async i(keyvals) {
    this.logit(keyvals, 'info')
  }

  private async logit(keyvals, level) {
    let entry = {}
    entry['event'] = keyvals.event
    entry['uid'] = keyvals.uid
    entry['phoneNumber'] = keyvals.phoneNumber
    entry['level'] = level
    entry['date'] = firebase.firestore.Timestamp.now().toDate()
    entry['date_ms'] = firebase.firestore.Timestamp.now().toMillis()
    await this.db.collection('log').add(entry)
  }
}
