import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { take } from 'rxjs/operators';
import * as _ from 'lodash'
import { InvitationService } from '../invitation/invitation.service';


@Injectable({
  providedIn: 'root'
})
export class SmsService {

  constructor(public afs: AngularFirestore,
              private invitationService: InvitationService) { }

  /**
   * re:  https://headsupvideo.atlassian.net/browse/HEADSUP-118
   * We aren't checking for opt-in here
   * We check for the opt-in at the firebase trigger in twilio-sms.js:sendSms() because that is where
   * all SMS messages are sent from.  That is the one place where we can check for opt-in and know 
   * that we have the opt-in/opt-out status handled 
   */
  async sendSms(args: {from: string, to: string, mediaUrl: string, message: string}) {
    // Write to the sms collection
    var doc = {}
    doc['from'] = args.from;
    doc['to'] = args.to;
    if(args.mediaUrl) doc['mediaUrl'] = args.mediaUrl;
    doc['message'] = args.message;
    doc['date'] = firebase.firestore.Timestamp.now().toDate();
    doc['date_ms'] = firebase.firestore.Timestamp.now().toMillis();
    console.log('sms = ', doc);
    this.afs.collection('sms').add(doc);
  }

    async reviewSms() {
        let observable = this.afs.collection('sms', ref => ref.orderBy('date_ms', 'asc').limitToLast(5)).snapshotChanges().pipe(take(1))
        let smsPromise = await observable.toPromise()
        let smsMessages = []
        _.each(smsPromise, smsThing => {
            // let id = smsThing.payl//payload.doc['id']
            // smsMessages.push({ smsThing.payload.doc['id'], ...smsThing.payload.doc.data() });
            let id = smsThing.payload.doc['id']
            smsMessages.push({id, ...smsThing.payload.doc.data()});
        })
        
        console.log('smsMessages:  ', smsMessages)
        return smsMessages
        // ref = ref.orderBy('date_ms', this.reverse ? 'desc' : 'asc').startAt(this.dates.date2).endAt(this.dates.date1);
    }


    private async optIn(args: {from: string, to: string, mediaUrl: string, message: string}): Promise<boolean> {
        if(!args) return false
        if(!args.to) return false
        return await this.invitationService.queryOptIn(args.to)
    }
}
