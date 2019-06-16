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
    entry['displayName'] = keyvals.displayName
    entry['level'] = level
    entry['date'] = firebase.firestore.Timestamp.now().toDate()
    entry['date_ms'] = firebase.firestore.Timestamp.now().toMillis()
    await this.db.collection('log').add(entry)
  }
}
