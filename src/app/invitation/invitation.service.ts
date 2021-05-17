import { Injectable } from '@angular/core';
import { Invitation } from './invitation.model';
import { AngularFirestore, AngularFirestoreCollection/*, CollectionReference*/ } from '@angular/fire/firestore';
import { UserService } from '../user/user.service';
import { LogService } from '../log/log.service';
import { take } from 'rxjs/operators';
import * as _ from 'lodash'
import { Settings } from '../settings/settings.model';


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
      if(!invitation.invitationId) { // this BETTER be there   (invitation-form.component.ts: onSubmit())
        invitation.invitationId = this.afs.createId();
      }

      let batch = this.afs.firestore.batch();

      // make the doc key different from the invitation id so that the invitation id can be duplicated (so we can invite more than one guest)
      let docKey = this.afs.createId();
      var invitationRef = this.afs.collection('invitation').doc(docKey).ref;
      invitation.docId = docKey
      batch.set(invitationRef, invitation.toObj());
      
      await batch.commit();
      this.log.i('created invitation: docKey = '+docKey);

      // not sure if there's really a need to return this
      return invitation.invitationId;

      // good example of transactions:
      // https://stackoverflow.com/questions/47532694/firestore-transaction-update-multiple-documents-in-a-single-transaction?rq=1
    
  }



  deleteInvitation(docId: string) {
      let promise = this.afs.collection('invitation').doc(docId).update({deleted_ms: new Date().getTime()})
      return promise
  }


  async deleteInvitations(invitationId: string) {      
      let batch = this.afs.firestore.batch();
      let observable = this.afs.collection('invitation', ref => ref.where("invitationId", "==", invitationId)).snapshotChanges().pipe(take(1));
      let docChangeActions = await observable.toPromise()
      if(docChangeActions && docChangeActions.length > 0) {
          _.each(docChangeActions, obj => {
              let inv = obj.payload.doc.data() as Invitation
              let docId = obj.payload.doc['id']
              let ref = this.afs.collection('invitation').doc(docId).ref
              batch.update(ref, {deleted_ms: new Date().getTime()})
          })
          await batch.commit()
          delete this.invitations
          this.invitations = []
      }
  }


  getInvitationsForUser(userId: string) {
    var retThis = this.afs.collection('invitation', ref => ref.where("creatorId", "==", userId).orderBy('created_ms')).snapshotChanges();
    return retThis;
  }


  // getInvitations(invitationId: string) {
  //     console.log('invitation.service:  invitationId: ', invitationId, 'query by iinvitationIdd')
  //     // return this.afs.collection('invitation', ref => ref.where("invitationId", "==", invitationId)).snapshotChanges()//.pipe(take(1));

  //     return new Observable<any>(ob => { 
  //       console.log('getInvitations():  invitationId = ', invitationId)
  //       var observable = this.afs.collection('invitation', ref => ref.where("invitationId", "==", invitationId)).snapshotChanges().pipe(take(1));
  //       observable.subscribe(docChangeActions => {
  //           let invitations:Invitation[] = []
  //           if(docChangeActions && docChangeActions.length > 0) {
  //               _.each(docChangeActions, obj => {
  //                   let inv = obj.payload.doc.data() as Invitation
  //                   inv.docId = obj.payload.doc['id']
  //                   console.log('getInvitations():  invitation: ', inv)
  //                   invitations.push(inv)
  //                   this.invitations.push(inv)
  //                   console.log('getInvitations():  invitations: ', invitations)
  //               })
  //           }
  //           console.log('getInvitations():  invitationId: ', invitationId)
  //           console.log('getInvitations():  invitations: ', invitations)
  //           ob.next(invitations)
  //       })

  //     })


  // }


    async getInvitations(invitationId: string) {
      var observable = this.afs.collection('invitation', ref => ref.where("invitationId", "==", invitationId).where("deleted_ms", "==", -1)).snapshotChanges().pipe(take(1));
      let docChangeActions = await observable.toPromise()
      let invitations:Invitation[] = []
      if(docChangeActions && docChangeActions.length > 0) {
        _.each(docChangeActions, obj => {
          let inv = obj.payload.doc.data() as Invitation
          inv.docId = obj.payload.doc['id']
          console.log('invitation: ', inv)
          invitations.push(inv)
          this.invitations.push(inv)
          console.log('invitations: ', invitations)
        })
      }
      console.log('invitationId: ', invitationId)
      console.log('invitations: ', invitations)
      return invitations
    }


  /**
   * Originally created for video-call.component.ts so that we could send the user to /invitation-deleted
   * if the host ever deletes an invitation
   * @param invitationId 
   */
  monitorInvitation(docId: string) {      
      var retThis = this.afs.collection('invitation').doc(docId).snapshotChanges();
      return retThis;
  }


  async updateEmail(invitation: Invitation) {
      await this.afs.collection('invitation').doc(invitation.docId).update({email: invitation.email})
  }


  async emailInvitation(invitation: Invitation, settings: Settings) {
      const doc = {
          to: invitation.email,
          from: settings.from_email,
          subject: 'HeadsUp! video call invitation from '+invitation.creatorName,
          text: invitation.message,
          html: ''
      }
      await this.afs.collection('email').add(doc)
  }

  


    /**
     * Write to the invitation doc the same elements that we write to the user doc whenever a problem is discovered with 
     * cammera, mic or text messages not going out.
     * When you write to the invitation doc, the changes will be detected by the host because everyone is monitoring
     * all the invitations in video-call.component.ts monitorInvitations()
     */
    async writeEnablements(invitation: Invitation, webcamReady: {passed: boolean, camera: boolean, camResult: string, mic: boolean, micResult: string, userAgent: string}) {
        // this happens for the host in video-call.guard.ts.
        // This function is really intended for guests, when the invitation exists
        if(!invitation) return 
        if(!invitation.docId) return 

        /**
         * Write this to the invitation doc:
         * cameraCheckDate
         * cameraCheckDate_ms
         * functional
         * userAgent
         */
        let date = new Date()
        let ms = date.getTime()
        let cameraStatus = {cameraCheckDate: date, cameraCheckDate_ms: ms, functional: webcamReady.camera, userAgent: webcamReady.userAgent}
        let micStatus = {micCheckDate: date, micCheckDate_ms: ms, functional: webcamReady.mic, userAgent: webcamReady.userAgent}
        await this.afs.collection('invitation').doc(invitation.docId).update({cameraCheck: cameraStatus, micCheck: micStatus})
    }


    /**
     * much better way to query when you only need one time results
     */
    async queryOptIn(phoneNumber: string) {
        //  twilio-sms.js : incomingSms()
        let optInSnapshots = await this.afs.collection('sms_opt_in', 
               ref => ref.where("From", "==", phoneNumber)
                        .orderBy("incoming_sms_date_ms", "asc")
                        .limitToLast(1))
              .get({source: 'server'}) // makes sure you don't get cached results - I shouldn't have to do this
              .toPromise()

        let optIns = []
        optInSnapshots.forEach((doc) => {
            console.log('optInSnapshots:  doc.data() = ', doc.data())
            optIns.push(doc.data())
        })
        if(optIns.length === 0) return false

        // 0th element ONLY works because you're doing limitToLast(1) above
        return optIns[0]['opt-in']
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
    invitation.invitationId = invitationDoc.data().invitationId;
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
name  is inviting you to participate in a video call on HeadsUp.  Click the link below to see this invitation.
\n\n
url
\n\n
Do not reply to this text message.  This number is not being monitored.
   **/
}
