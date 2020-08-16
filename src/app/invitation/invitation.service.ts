import { Injectable } from '@angular/core';
import { Invitation } from './invitation.model';
import { AngularFirestore, AngularFirestoreCollection/*, CollectionReference*/ } from '@angular/fire/firestore';
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


  createId() {
    return this.afs.createId();
  }


  async create(invitation: Invitation): Promise<string> {
    let name = invitation.displayName;
    if(!invitation.id) {
      invitation.id = this.afs.createId();
    }

    let batch = this.afs.firestore.batch();
    var invitationRef = this.afs.collection('invitation').doc(invitation.id).ref;
    batch.set(invitationRef, invitation.toObj());
    
    await batch.commit();
    this.log.i('created invitation '+invitation.id);
    return invitation.id;

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


  async getInvitation(displayName: string, parm: {protocol: string, host: string, pathname: string}): Promise<string> {
    var res = await this.afs.collection('config').doc('invitation_template').ref.get();
    let invitation = res.data().text.replace(/name/, displayName);
    let ngrok = "9925171f6ca4.ngrok.io"
    let host = parm.host.indexOf("localhost") == -1 ? parm.host : ngrok
    let url = parm.protocol+"//"+host+parm.pathname
    invitation = invitation.replace(/url/, url);
    return invitation;
  }


  /**
name  is inviting you to participate in a video call on SeeSaw.  Click the link below to see this invitation.

url

Do not reply to this text message.  This number is not being monitored.
   **/
}
