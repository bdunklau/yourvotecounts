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
import { MessageService } from '../core/message.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(
    private afs: AngularFirestore,
    private messageService: MessageService,
    private log: LogService) { }

  addUserToTeam(team: Team, user: FirebaseUserModel) {
    let batch = this.afs.firestore.batch();
    var teamMemberDocId = this.afs.createId();
    var teamMemberRef = this.afs.collection('team_member').doc(teamMemberDocId).ref;
    var teamMember = {teamMemberDocId: teamMemberDocId,
                      teamDocId: team.id,
                      created: firebase.firestore.Timestamp.now(),
                      team_name: team.name,
                      userId: user.uid,
                      displayName: user.displayName,
                      leader: false}
    batch.set(teamMemberRef, teamMember);

    var teamRef = this.afs.collection('team').doc(team.id).ref;
    batch.update(teamRef, {memberCount: firebase.firestore.FieldValue.increment(1)});
    batch.commit().then(() => {
      this.messageService.addTeamMember(teamMember as TeamMember);
    });
  }

  create(teamName: string, user: FirebaseUserModel) {
    let team = new Team();
    var teamDocId = this.afs.createId();
    team.id = teamDocId;
    team.name = teamName;
    team.memberCount = 1;
    team.created = firebase.firestore.Timestamp.now();
    team.memberCount = 1;
    team.leaderCount = 1;
    team.setCreator(user);

    let batch = this.afs.firestore.batch();
    var teamRef = this.afs.collection('team').doc(teamDocId).ref;
    batch.set(teamRef, team.toObj());

    var teamMemberDocId = this.afs.createId();
    var teamMemberRef = this.afs.collection('team_member').doc(teamMemberDocId).ref;
    var teamMember = {teamMemberDocId: teamMemberDocId,
                     teamDocId: teamDocId,
                     created: firebase.firestore.Timestamp.now(),
                     team_name: teamName,
                     userId: user.uid,
                     displayName: user.displayName,
                     leader: true}
    batch.set(teamMemberRef, teamMember);
    batch.commit().then(() => {
      this.messageService.updateTeam(team);
      this.messageService.updateTeamMembers([teamMember as TeamMember]);
    });

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
      batch.commit().then(() => {
        this.messageService.updateTeam(null);
      });
    });

  }


  async deleteTeamMember(team_member: TeamMember) {
    let batch = this.afs.firestore.batch();
    var teamMemberRef = this.afs.collection('team_member').doc(team_member.teamMemberDocId).ref;
    var teamRef = this.afs.collection('team').doc(team_member.teamDocId).ref;
    batch.delete(teamMemberRef);
    batch.update(teamRef, {memberCount: firebase.firestore.FieldValue.increment(-1)});
    if(team_member.leader)
      batch.update(teamRef, {leaderCount: firebase.firestore.FieldValue.increment(-1)});
    batch.commit().then(() => {
      this.messageService.deleteTeamMember(team_member);
    });
    return await this.getTeamData(team_member.teamDocId);
  }


  async getTeamData(teamDocId: string) {
    var teamDoc = await this.afs.collection('team').doc(teamDocId).ref.get();
    return teamDoc.data() as Team;
  }


  getMembers(team: Team) {
    var retThis = this.afs.collection('team_member', ref => ref.where("teamDocId", "==", team.id)).snapshotChanges();
    return retThis;
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
