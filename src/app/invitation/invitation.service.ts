import { Injectable } from '@angular/core';
import { Invitation } from './invitation.model';
import { AngularFirestore, AngularFirestoreCollection/*, CollectionReference*/ } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { UserService } from '../user/user.service';
import { LogService } from '../log/log.service';


@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private log: LogService,) { }

  async create(invitation: Invitation): Promise<string> {
    let name = invitation.displayName;
    var invitationDocId = this.afs.createId();
    invitation.id = invitationDocId;
    invitation.created = firebase.firestore.Timestamp.now();
    const user = await this.userService.getCurrentUser();
    invitation.setCreator(user);

    let batch = this.afs.firestore.batch();
    var invitationRef = this.afs.collection('invitation').doc(invitationDocId).ref;
    batch.set(invitationRef, invitation.toObj());
    
    await batch.commit();
    this.log.i('created invitation '+invitation.id);
    return invitationDocId;

    // good example of transactions:
    // https://stackoverflow.com/questions/47532694/firestore-transaction-update-multiple-documents-in-a-single-transaction?rq=1
  
  }


  /* async */ deleteInvitation(invitation: Invitation) {
    let batch = this.afs.firestore.batch();
    var invitationRef = this.afs.collection('invitation').doc(invitation.id).ref;
    batch.delete(invitationRef);
    //batch.update(teamRef, {memberCount: firebase.firestore.FieldValue.increment(-1)});
    /* await */ batch.commit();
    this.log.i('deleted '+invitation.id);
    //return await this.getTeamData(team_member.teamDocId);
  }


  getInvitationsForUser(userId: string) {
    var retThis = this.afs.collection('invitation', ref => ref.where("creatorId", "==", userId)).snapshotChanges();
    return retThis;
  }
}
