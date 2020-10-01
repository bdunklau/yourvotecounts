import { Injectable } from '@angular/core';
import { Invitation } from './invitation.model';
import { AngularFirestore, AngularFirestoreCollection/*, CollectionReference*/ } from '@angular/fire/firestore';
import { UserService } from '../user/user.service';
import { LogService } from '../log/log.service';
import { take } from 'rxjs/operators';
import * as _ from 'lodash'
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  
  private ngrok = "ca5ef009dcd4.ngrok.io";

  // use to pass invitation objects from guards to components
  //invitation: Invitation
  invitations: Invitation[] = [] // see  ValidInvitationGuard

  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private log: LogService,) { }


  createId() {
    return this.afs.createId();
  }


  async create(invitation: Invitation): Promise<string> {
      let name = invitation.displayName;
      if(!invitation.id) { // this BETTER be there   (invitation-form.component.ts: onSubmit())
        invitation.id = this.afs.createId();
      }

      let batch = this.afs.firestore.batch();

      // make the doc key different from the invitation id so that the invitation id can be duplicated (so we can invite more than one guest)
      let docKey = this.afs.createId();
      var invitationRef = this.afs.collection('invitation').doc(docKey).ref;
      batch.set(invitationRef, invitation.toObj());
      
      await batch.commit();
      this.log.i('created invitation: docKey = '+docKey);

      // not sure if there's really a need to return this
      return invitation.id;

      // good example of transactions:
      // https://stackoverflow.com/questions/47532694/firestore-transaction-update-multiple-documents-in-a-single-transaction?rq=1
    
  }



  /**
   * THIS DOESN'T WORK ANYMORE BECAUSE invitation.id IS NOT THE DOC ID ANYMORE
   */
  // TODO FIXME
  /* async */ deleteInvitation_needs_fixing(invitation: Invitation) {
    let batch = this.afs.firestore.batch();
    var invitationRef = this.afs.collection('invitation').doc(invitation.id).ref;
    batch.delete(invitationRef);
    //batch.update(teamRef, {memberCount: firebase.firestore.FieldValue.increment(-1)});
    /* await */ batch.commit();
    this.log.i('deleted '+invitation.id);
    //return await this.getTeamData(team_member.teamDocId);
  }


  deleteInvitation(docId: string) {
      this.afs.collection('invitation').doc(docId).update({deleted_ms: new Date().getTime()})
  }


  async deleteInvitations(invitationId: string) {      
      let batch = this.afs.firestore.batch();
      let observable = this.afs.collection('invitation', ref => ref.where("id", "==", invitationId)).snapshotChanges().pipe(take(1));
      let docChangeActions = await observable.toPromise()
      if(docChangeActions && docChangeActions.length > 0) {
          _.each(docChangeActions, obj => {
              let inv = obj.payload.doc.data() as Invitation
              let docId = obj.payload.doc.id
              let ref = this.afs.collection('invitation').doc(docId).ref
              batch.update(ref, {deleted_ms: new Date().getTime()})
          })
          batch.commit()
      }
  }


  getInvitationsForUser(userId: string) {
    var retThis = this.afs.collection('invitation', ref => ref.where("creatorId", "==", userId).orderBy('created_ms')).snapshotChanges();
    return retThis;
  }


  getInvitations(invitationId: string) {
      var observable = this.afs.collection('invitation', ref => ref.where("id", "==", invitationId)).snapshotChanges().pipe(take(1));
      return new Observable<any>(ob => { 

        observable.subscribe(docChangeActions => {
            let invitations:Invitation[] = []
            if(docChangeActions && docChangeActions.length > 0) {
                _.each(docChangeActions, obj => {
                    let inv = obj.payload.doc.data() as Invitation
                    inv.docId = obj.payload.doc.id
                    console.log('invitation: ', inv)
                    invitations.push(inv)
                    this.invitations.push(inv)
                    console.log('invitations: ', invitations)
                })
            }
            console.log('invitationId: ', invitationId)
            console.log('invitations: ', invitations)
            ob.next(invitations)
        })

      })




  }


  /////////////////////////////////////////////////////////////////////////////////
  // REPLACED BY THE VERSION ABOVE THAT STICKS WITH OBSERVABLES BECAUSE OF ANGULAR UNIVERSAL
  //
  // async getInvitations(invitationId: string) {
  //   var observable = this.afs.collection('invitation', ref => ref.where("id", "==", invitationId)).snapshotChanges().pipe(take(1));
  //   let docChangeActions = await observable.toPromise()
  //   let invitations:Invitation[] = []
  //   if(docChangeActions && docChangeActions.length > 0) {
  //     _.each(docChangeActions, obj => {
  //       let inv = obj.payload.doc.data() as Invitation
  //       inv.docId = obj.payload.doc.id
  //       console.log('invitation: ', inv)
  //       invitations.push(inv)
  //       this.invitations.push(inv)
  //       console.log('invitations: ', invitations)
  //     })
  //   }
  //   console.log('invitationId: ', invitationId)
  //   console.log('invitations: ', invitations)
  //   return invitations
  // }


  /**
   * Originally created for video-call.component.ts so that we could send the user to /invitation-deleted
   * if the host ever deletes an invitation
   * @param invitationId 
   */
  monitorInvitation(docId: string) {      
      var retThis = this.afs.collection('invitation').doc(docId).snapshotChanges();
      return retThis;
  }



  // TODO FIXME is this fixed?
  /************
  async getInvitation(invitationId: string) {
    var invitationDoc = await this.afs.collection('invitation').doc(invitationId).ref.get();
    if(!invitationDoc || !invitationDoc.data()) {
      console.log("getInvitation(): no invitation for ", invitationId);
      return null;
    }
    const invitation = new Invitation();
    invitation.id = invitationDoc.data().id;
    invitation.displayName = invitationDoc.data().displayName;
    invitation.phoneNumber = invitationDoc.data().phoneNumber;
    invitation.created = invitationDoc.data().created;
    invitation.created_ms = invitationDoc.data().created_ms;
    invitation.creatorId = invitationDoc.data().creatorId;
    invitation.creatorName = invitationDoc.data().creatorName;
    invitation.creatorPhone = invitationDoc.data().creatorPhone;
    invitation.message = invitationDoc.data().message;
    console.log('invitationDoc.data() = ', invitationDoc.data());
    return invitation;
  }
  ***********/


  /************
  async getInvitationMessage(displayName: string, parm: {protocol: string, host: string, pathname: string}): Promise<string> {
    var res = await this.afs.collection('config').doc('invitation_template').ref.get();
    let invitation = res.data().text.replace(/name/, displayName);
    let host = parm.host.indexOf("localhost") == -1 ? parm.host : this.ngrok
    let url = parm.protocol+"//"+host+parm.pathname
    invitation = invitation.replace(/url/, url);
    invitation = invitation.replace(/\\n/g, "\n");
    return invitation;
  }
  ***********/



  /**
name  is inviting you to participate in a video call on SeeSaw.  Click the link below to see this invitation.
\n\n
url
\n\n
Do not reply to this text message.  This number is not being monitored.
   **/
}
