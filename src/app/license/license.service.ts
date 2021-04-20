import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MessageService } from '../core/message.service';
import { Licensee } from './licensee/licensee.model';
import { LicenseeContact } from './licensee-contact/licensee-contact.model';

/**
 *  ng generate class license/licensee/licensee --type=model
 */
@Injectable({
  providedIn: 'root'
})
export class LicenseService {

    constructor(
      private afs: AngularFirestore,
      private messageService: MessageService,
      ) { }



    async saveLicensee(licensee: Licensee): Promise<string> {
        if(!licensee.id) licensee.id = this.afs.createId()
        await this.afs.collection('licensee').doc(licensee.id).set(licensee.toObj())
        this.messageService.setCurrentLicensee(licensee)
        return licensee.id;
  
      // good example of transactions:
      // https://stackoverflow.com/questions/47532694/firestore-transaction-update-multiple-documents-in-a-single-transaction?rq=1
    }


    // don't think we need async await here
    addLicenseeContact(licenseeContact: LicenseeContact) {
        console.log('new lic contact: ', licenseeContact)
        if(!licenseeContact.id) licenseeContact.id = this.afs.createId()
        this.afs.collection('licensee_contact').doc(licenseeContact.id).set(licenseeContact.toObj())
    }


    /**
     * return all licensees
     */
    getLicensees() {
        var retThis = this.afs.collection('licensee').snapshotChanges();
        return retThis;
    }

    
    getLicenseeContacts(licensee: Licensee) {
      var retThis = this.afs.collection('licensee_contact', ref => ref.where('licenseeId', '==', licensee.id)).snapshotChanges();
      return retThis;
    }


    deleteLicenseeContact(licenseeContact: LicenseeContact) {
        this.afs.collection('licensee_contact').doc(licenseeContact.id).delete()
    }

    

    // getMembersByTeamId(id: string) {
    //     // Observable< DocumentChangeAction <unknown> []>
    //     var retThis = this.afs.collection('team_member', ref => ref.where("teamDocId", "==", id)).snapshotChanges();
    //     return retThis;
    // }


}
