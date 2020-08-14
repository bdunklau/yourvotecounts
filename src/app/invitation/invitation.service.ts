import { Injectable } from '@angular/core';
import { Invitation } from './invitation.model';
import { AngularFirestore, AngularFirestoreCollection/*, CollectionReference*/ } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { UserService } from '../user/user.service';


@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  constructor(
    private afs: AngularFirestore,
    private userService: UserService,) { }

  async create(invitation: Invitation): Promise<string> {
    let name = invitation.displayName;
    var invitationDocId = this.afs.createId();
    invitation.id = invitationDocId;
    invitation.created = firebase.firestore.Timestamp.now();
    const user = await this.userService.getCurrentUser();
    invitation.setCreator(user);

  
  
  }
}
