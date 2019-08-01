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

  async beginCreateTeam(user) {
    await this.info(user, 'begin creating team');
  }

  async createdTeam(user, team) {
    await this.info(user, 'created team: "'+team.name+'"  (team ID: '+team.id+') ');
  }

  async deletedTeam(team: Team) {
    const user = await this.userService.getCurrentUser();
    await this.info(user, 'deleted team: '+team.name+' (team ID: '+team.id+')');
  }

  async deletedTeamMember(team_member: TeamMember) {
    const user = await this.userService.getCurrentUser();
    await this.info(user, 'deleted "'+team_member.displayName+'"  (ID: '+team_member.userId+') from team: '+team_name+' (team ID: '+team_member.teamDocId+')');
  }

  deleteLogs(eventValue: string) {
    this.xxx('log_debug', eventValue);
    this.xxx('log_info', eventValue);
    this.xxx('log_error', eventValue);
  }

  async login(user) {
    await this.info(user, 'login');
  }

  async logout(user) {
    await this.info(user, 'logout');
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

  private async info(user, event: string) {
    var entry = {event: event}
    if(user.uid) entry['uid'] = user.uid;
    if(user.displayName) entry['displayName'] = user.displayName;
    if(user.phoneNumber) entry['phoneNumber'] = user.phoneNumber;
    await this.i(entry);
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

  async updatedTeam(user, teamName, teamId) {
    await this.info(user, 'updated team: "'+teamName+'"  (team ID: '+teamId+') ');
  }

}
