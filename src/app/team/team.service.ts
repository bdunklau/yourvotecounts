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
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(
    private afs: AngularFirestore,
    private messageService: MessageService,
    private userService: UserService,
    private log: LogService,) { }

  addUserToTeam(team: Team, user: FirebaseUserModel) {
    let batch = this.afs.firestore.batch();
    var teamMemberDocId = this.afs.createId();
    var teamMemberRef = this.afs.collection('team_member').doc(teamMemberDocId).ref;
    var teamMember = {teamMemberDocId: teamMemberDocId,
                      creatorId: team.creatorId,
                      access_expiration_ms: team.access_expiration_ms,
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
      // this.messageService.addTeamMember(teamMember as TeamMember); // only updates the client you're on - not that useful
    });
  }

  async create(team: Team): Promise<string> {
    let teamName = team.name
    var teamDocId = this.afs.createId();
    team.id = teamDocId;
    team.name = teamName;
    team.memberCount = 1;
    team.created = firebase.firestore.Timestamp.now();
    team.memberCount = 1;
    team.leaderCount = 1;
    const user = await this.userService.getCurrentUser();
    team.setCreator(user);

    let batch = this.afs.firestore.batch();
    var teamRef = this.afs.collection('team').doc(teamDocId).ref;
    batch.set(teamRef, team.toObj());

    var teamMemberDocId = this.afs.createId();
    var teamMemberRef = this.afs.collection('team_member').doc(teamMemberDocId).ref;
    var teamMember = { access_expiration_ms: user.access_expiration_ms,
                     teamMemberDocId: teamMemberDocId,
                     teamDocId: teamDocId,
                     created: firebase.firestore.Timestamp.now(),
                     creatorId: user.uid,
                     team_name: teamName,
                     userId: user.uid,
                     displayName: user.displayName,
                     leader: true}
    batch.set(teamMemberRef, teamMember);
    await batch.commit();
    this.log.i('created team '+team.debug());
    return teamDocId;

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
        batch.delete(dt.payload.doc['ref']);
      });
      batch.commit().then(() => {
        this.log.i('deleted team '+team.debug());
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
    await batch.commit();
    console.log('team_member = ', team_member);
    this.log.i('deleted '+team_member.debug());
    return await this.getTeamData(team_member.teamDocId);
  }


  async getTeamData(teamDocId: string) {
    var teamDoc = await this.afs.collection('team').doc(teamDocId).ref.get();
    const team = new Team();
    team.id = teamDoc.data()['id'];
    team.access_expiration_ms = teamDoc.data()['access_expiration_ms']
    team.name = teamDoc.data()['name'];
    team.created = teamDoc.data()['created'];
    team.creatorId = teamDoc.data()['creatorId'];
    team.creatorName = teamDoc.data()['creatorName'];
    team.creatorPhone = teamDoc.data()['creatorPhone'];
    team.leaderCount = teamDoc.data()['leaderCount']; // e2e testing caught this omission :)
    team.memberCount = teamDoc.data()['memberCount']; // e2e testing caught this omission :)
    console.log('teamDoc.data() = ', teamDoc.data());
    return team;
  }


  getMembers(team: Team) {
    return this.getMembersByTeamId(team.id);
  }


  getMembersByTeamId(id: string) {
    // Observable< DocumentChangeAction <unknown> []>
    var retThis = this.afs.collection('team_member', ref => ref.where("teamDocId", "==", id)).snapshotChanges();
    return retThis;
  }


  getTeamsForUser(userId: string) {
    var retThis = this.afs.collection('team_member', ref => ref.where("userId", "==", userId)).snapshotChanges();
    return retThis;
  }

  update(team: Team) {
    let teamId = team.id;
    let teamName = team.name
    let batch = this.afs.firestore.batch();

    var teamRef = this.afs.collection('team').doc(teamId).ref;
    batch.update(teamRef, {name: teamName});

    var ref = this.afs.collection('team_member', rf => rf.where("teamDocId", "==", teamId)).snapshotChanges().pipe(take(1));
    ref.subscribe(data  => {
      data.forEach(function(dt) {
        batch.update(dt.payload.doc['ref'], {team_name: teamName});
      });
      batch.commit().then(() => {
        this.log.i('updated team '+team.debug());
      });
    });
  }

  // Return a Promise that the caller can do its own thing in its own then()
  updateMember(team_member: TeamMember): Promise<any> {
    let batch = this.afs.firestore.batch();
    var teamRef = this.afs.collection('team').doc(team_member.teamDocId).ref;
    var incrValue = team_member.leader ? 1 : -1;
    batch.update(teamRef, {leaderCount: firebase.firestore.FieldValue.increment(incrValue)});
    var memberRef = this.afs.collection('team_member').doc(team_member.teamMemberDocId).ref;
    batch.update(memberRef, {leader: team_member.leader});
    return batch.commit();
  }
}
