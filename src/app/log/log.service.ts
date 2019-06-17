import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(
    public db: AngularFirestore,) { }

  async cachedUser(user) {
    var entry = {event: 'get cached user'}
    if(user.uid) entry['uid'] = user.uid;
    if(user.displayName) entry['displayName'] = user.displayName;
    if(user.phoneNumber) entry['phoneNumber'] = user.phoneNumber;
    await this.d(entry);
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

  async d(keyvals) {
    this.logit(keyvals, 'debug', 1)
  }

  async i(keyvals) {
    this.logit(keyvals, 'info', 2)
  }

  private async logit(keyvals, level, level_number) {
    let entry = {}
    if(keyvals.event) entry['event'] = keyvals.event
    if(keyvals.uid) entry['uid'] = keyvals.uid
    if(keyvals.phoneNumber) entry['phoneNumber'] = keyvals.phoneNumber
    if(keyvals.displayName) entry['displayName'] = keyvals.displayName
    if(level) entry['level'] = level
    if(level_number) entry['level_number'] = level_number
    entry['date'] = firebase.firestore.Timestamp.now().toDate()
    entry['date_ms'] = firebase.firestore.Timestamp.now().toMillis()
    await this.db.collection('log').add(entry)
  }
}
