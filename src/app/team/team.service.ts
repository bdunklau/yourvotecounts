import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection/*, CollectionReference*/ } from '@angular/fire/firestore';
import { LogService } from '../log/log.service';
import { Team } from './team.model';
import { FirebaseUserModel } from '../user/user.model';
import { TeamMember } from './team-member.model';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

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
    // let teamMember = new TeamMember(user);
    // let teamMember = new TeamMember({teamMemberDocId: this.afs.createId(),
    //                                  teamDocId: teamDocId,
    //                                  team_name: teamName,
    //                                  userId: user.uid,
    //                                  displayName: user.displayName,
    //                                  leader: true});
    // team.members.push(teamMember);

    let batch = this.afs.firestore.batch();
    var teamRef = this.afs.collection('team').doc(teamDocId).ref;
    batch.set(teamRef, team.toObj());

    var teamMemberRef = this.afs.collection('team_member').doc(this.afs.createId()).ref;
    batch.set(teamMemberRef, {teamMemberDocId: this.afs.createId(),
                               teamDocId: teamDocId,
                               created: firebase.firestore.Timestamp.now(),
                               team_name: teamName,
                               userId: user.uid,
                               displayName: user.displayName,
                               leader: true});

    // user.teams.push(team.toObj());
    // var userRef = this.afs.collection('user').doc(user.uid).ref;
    // batch.update(userRef, {teams: user.teams});
    batch.commit();

    // good example of transactions:
    // https://stackoverflow.com/questions/47532694/firestore-transaction-update-multiple-documents-in-a-single-transaction?rq=1
  }

  getTeamsForUser(userId: string) {
    var retThis = this.afs.collection('team_member', ref => ref.where("userId", "==", userId)).snapshotChanges();
    return retThis;
  }

  update(teamId: string, teamName: string, user: FirebaseUserModel) {
    // this.afs.collection('team').doc(teamId).update(team.toObj());
  }
}
