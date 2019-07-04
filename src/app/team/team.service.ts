import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection/*, CollectionReference*/ } from '@angular/fire/firestore';
import { LogService } from '../log/log.service';
import { Team } from './team.model';
import { FirebaseUserModel } from '../user/user.model';
import { TeamMember } from './team-member.model';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(
    private afs: AngularFirestore,
    private log: LogService) { }

  create(teamName: string, user: FirebaseUserModel) {
    let team = new Team();
    var teamDocId = this.afs.createId();
    team.id = teamDocId;
    team.name = teamName;
    team.memberCount = 1;
    team.created = firebase.firestore.Timestamp.now();
    team.setCreator(user);

    let batch = this.afs.firestore.batch();
    var teamRef = this.afs.collection('team').doc(teamDocId).ref;
    batch.set(teamRef, team.toObj());

    var teamMemberDocId = this.afs.createId();
    var teamMemberRef = this.afs.collection('team_member').doc(teamMemberDocId).ref;
    batch.set(teamMemberRef, {teamMemberDocId: teamMemberDocId,
                               teamDocId: teamDocId,
                               created: firebase.firestore.Timestamp.now(),
                               team_name: teamName,
                               userId: user.uid,
                               displayName: user.displayName,
                               leader: true});
    batch.commit();

    // good example of transactions:
    // https://stackoverflow.com/questions/47532694/firestore-transaction-update-multiple-documents-in-a-single-transaction?rq=1
  }

  async deleteTeam(team: Team) {
    let batch = this.afs.firestore.batch();

    var teamRef = this.afs.collection('team').doc(team.id).ref;
    batch.delete(teamRef);

    var ref = this.afs.collection('team_member', rf => rf.where("teamDocId", "==", team.id)).snapshotChanges().pipe(take(1));
    ref.subscribe(data  => {
      data.forEach(function(dt) {
        batch.delete(dt.payload.doc.ref);
      });
      batch.commit();
    });

  }


  getTeamsForUser(userId: string) {
    var retThis = this.afs.collection('team_member', ref => ref.where("userId", "==", userId)).snapshotChanges();
    return retThis;
  }

  update(teamId: string, teamName: string, user: FirebaseUserModel) {
    let batch = this.afs.firestore.batch();

    var teamRef = this.afs.collection('team').doc(teamId).ref;
    batch.update(teamRef, {name: teamName});

    var ref = this.afs.collection('team_member', rf => rf.where("teamDocId", "==", teamId)).snapshotChanges().pipe(take(1));
    ref.subscribe(data  => {
      data.forEach(function(dt) {
        batch.update(dt.payload.doc.ref, {team_name: teamName});
      });
      batch.commit();
    });
  }
}
