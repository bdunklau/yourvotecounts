import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { /*map,*/ take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(
    public db: AngularFirestore,) { }

  private xxx(logtype, eventValue) {
    let batch = this.db.firestore.batch();
    var ref = this.db.collection(logtype, rf => rf.where("event", "==", eventValue)).snapshotChanges().pipe(take(1));
    ref.subscribe(data  => {
      data.forEach(function(dt) {
        batch.delete(dt.payload.doc.ref);
      });
      batch.commit();
    });
  }

  deleteLogs(eventValue: string) {
    this.xxx('log_debug', eventValue);
    this.xxx('log_info', eventValue);
    this.xxx('log_error', eventValue);
  }

  async login(user) {
    console.log('LogService.login()  user: ', user)
    var entry = {event: 'login'}
    if(user.uid) entry['uid'] = user.uid;
    if(user.displayName) entry['displayName'] = user.displayName;
    if(user.phoneNumber) entry['phoneNumber'] = user.phoneNumber;
    await this.i(entry);
  }

  async logout(user) {
    var entry = {event: 'logout'}
    if(user.uid) entry['uid'] = user.uid;
    if(user.displayName) entry['displayName'] = user.displayName;
    if(user.phoneNumber) entry['phoneNumber'] = user.phoneNumber;
    await this.i(entry);
  }

  async e(keyvals) {
    this.logit(keyvals, 'error')
  }

  async d(keyvals) {
    this.logit(keyvals, 'debug')
  }

  async i(keyvals) {
    this.logit(keyvals, 'info')
  }

  // call d() e() and i() - not this function, except for testing
  async logit(keyvals, level) {
    let entry = {}
    if(keyvals.event) entry['event'] = keyvals.event
    if(keyvals.uid) entry['uid'] = keyvals.uid
    if(keyvals.phoneNumber) entry['phoneNumber'] = keyvals.phoneNumber
    if(keyvals.displayName) entry['displayName'] = keyvals.displayName
    if(level) entry['level'] = level
    entry['date'] = keyvals.date ? keyvals.date : firebase.firestore.Timestamp.now().toDate();
    entry['date_ms'] = keyvals.date_ms ? keyvals.date_ms : firebase.firestore.Timestamp.now().toMillis();
    if(level === 'error') {
      await Promise.all([
        this.db.collection('log_error').add(entry),
        this.db.collection('log_info').add(entry),
        this.db.collection('log_debug').add(entry)
      ])
    }
    else if(level === 'info') {
      await Promise.all([
        this.db.collection('log_info').add(entry),
        this.db.collection('log_debug').add(entry)
      ])
    }
    else {
      await Promise.all([
        this.db.collection('log_debug').add(entry),
      ])
    }
  }

}
