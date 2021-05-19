import * as firebase from 'firebase/app';
import { FirebaseUserModel } from '../user/user.model';


// ng generate class invitation/invitation --type=model

export class Invitation {
    docId?: string  // the actual doc id.  See InvitationService.getInvitations(invitationId: string) 
    
    // DON'T NAME THE FIELD 'id'...
    //id: string; 

    // NAME IT 'invitationId'   FOR ONE THING, EASIER TO SEARCH CODE
    invitationId: string;  // can be shared among several Invitation documents

    displayName: string;
    phoneNumber: string;
    email?: string
    created: Date;
    created_ms: number;
    creatorId: string;
    creatorName: string;
    creatorPhone: string;
    creatorPhotoURL: string
    message: string;
    deleted_ms: number
    photoURL?: string
    // what about cameraCheck and micCheck ??????
    
    constructor() {
      this.created = new Date();
      this.created_ms = new Date().getTime();
      this.deleted_ms = -1 // start off not deleted
    }

  

  toObj(): any {
    let asObj = {invitationId: this.invitationId,
      displayName: this.displayName,
      phoneNumber: this.phoneNumber,
      created: this.created,
      created_ms: this.created_ms,
      creatorId: this.creatorId,
      creatorName: this.creatorName,
      creatorPhone: this.creatorPhone,
      creatorPhotoURL: this.creatorPhotoURL,
      message: this.message,
      deleted_ms: this.deleted_ms,
    }
    if(this.photoURL) asObj['photoURL'] = this.photoURL
    if(this.email) asObj['email'] = this.email
    // what about cameraCheck and micCheck ??????
    return asObj
  }
    

  setCreator(user: FirebaseUserModel) {
    this.creatorId = user.uid;
    this.creatorName = user.displayName;
    this.creatorPhone = user.phoneNumber;
    this.creatorPhotoURL = user.photoURL
  }
}
