import * as firebase from 'firebase/app';
import { FirebaseUserModel } from '../user/user.model';


// ng generate class invitation/invitation --type=model
export class Invitation {
    docId?: string  // the actual doc id.  See InvitationService.getInvitations(invitationId: string) 
    id: string;
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
    return {id: this.id,
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
