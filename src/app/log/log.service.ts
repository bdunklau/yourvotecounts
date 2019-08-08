import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { /*map,*/ take } from 'rxjs/operators';
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(
    public db: AngularFirestore,
    private userService: UserService) { }

  // private xxx(logtype, eventValue) {
  private xxx(opts: {logtype: string, by: string, value: string}) {
    let logtype = opts.logtype;
    let batch = this.db.firestore.batch();
    var ref = this.db.collection(logtype, rf => rf.where(opts.by, "==", opts.value)).snapshotChanges().pipe(take(1));
    ref.subscribe(data  => {
      data.forEach(function(dt) {
        batch.delete(dt.payload.doc.ref);
      });
      batch.commit();
    });
  }

  // deleteLogs(eventValue: string) {
  deleteLogs(opts: {by: string, value: string}) {
    this.xxx({logtype: 'log_debug', by: opts.by, value: opts.value});
    this.xxx({logtype: 'log_info', by: opts.by, value: opts.value});
    this.xxx({logtype: 'log_error', by: opts.by, value: opts.value});

    // this.xxx('log_debug', eventValue);
    // this.xxx('log_info', eventValue);
    // this.xxx('log_error', eventValue);
  }

  async e(keyvals) {
    this.logit(keyvals, 'error')
  }

  async d(keyvals) {
    this.logit(keyvals, 'debug')
  }

  async ii(keyvals) {
    this.logit(keyvals, 'info')
  }

  async i(event: string) {
    const user = await this.userService.getCurrentUser();
    var entry = {event: event}
    if(user.uid) entry['uid'] = user.uid;
    if(user.displayName) entry['displayName'] = user.displayName;
    if(user.phoneNumber) entry['phoneNumber'] = user.phoneNumber;
    await this.ii(entry);
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
