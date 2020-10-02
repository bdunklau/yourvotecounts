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
    created: Date;
    created_ms: number;
    creatorId: string;
    creatorName: string;
    creatorPhone: string;
    message: string;
    deleted_ms?: number
    
    constructor() {
      this.created = new Date();
      this.created_ms = new Date().getTime();
    }

  

  toObj(): any {
    return {invitationId: this.invitationId,
      displayName: this.displayName,
      phoneNumber: this.phoneNumber,
      created: this.created,
      created_ms: this.created_ms,
      creatorId: this.creatorId,
      creatorName: this.creatorName,
      creatorPhone: this.creatorPhone,
      message: this.message,};
  }
    

  setCreator(user: FirebaseUserModel) {
    this.creatorId = user.uid;
    this.creatorName = user.displayName;
    this.creatorPhone = user.phoneNumber;
  }
}
