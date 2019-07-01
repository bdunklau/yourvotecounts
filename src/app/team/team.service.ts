import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { LogService } from '../log/log.service';
import { Team } from './team.model';
import { FirebaseUserModel } from '../user/user.model';
import { TeamMember } from './team-member.model';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(
    private afs: AngularFirestore,
    private log: LogService) { }

  create(teamName: string, user: FirebaseUserModel) {
    let team = new Team();
    team.name = teamName;
    team.memberCount = 1;
    team.created = firebase.firestore.Timestamp.now().toDate();
    team.setCreator(user);
    let teamMember = new TeamMember(user);
    teamMember.setTeamLeader(true);
    team.members.push(teamMember);

    let batch = this.afs.firestore.batch();
    var teamRef = this.afs.collection('team').doc(this.afs.createId()).ref;
    batch.set(teamRef, team.toObj());
    var userRef = this.afs.collection('user').doc(user.uid).collection('teams').doc(this.afs.createId()).ref;
    batch.set(userRef, team.toShallowObj());
    batch.commit();

    // good example of transactions:
    // https://stackoverflow.com/questions/47532694/firestore-transaction-update-multiple-documents-in-a-single-transaction?rq=1
  }

  update(teamId: string, teamName: string, user: FirebaseUserModel) {
    // this.afs.collection('team').doc(teamId).update(team.toObj());
  }
}
