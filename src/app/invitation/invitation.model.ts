import * as firebase from 'firebase/app';
import { FirebaseUserModel } from '../user/user.model';


// ng generate class invitation/invitation --type=model
export class Invitation {
    id: string;
    displayName: string;
    phoneNumber: string;
    created: firebase.firestore.Timestamp;
    creatorId: string;
    creatorName: string;
    creatorPhone: string;
    message: string;
    
    constructor() {}

  

  toObj(): any {
    return {id: this.id,
      displayName: this.displayName,
      phoneNumber: this.phoneNumber,
      created: this.created,
      creatorId: this.creatorId,
      creatorName: this.creatorName,
      creatorPhone: this.creatorPhone,
      message: this.message};
  }
    

  setCreator(user: FirebaseUserModel) {
    this.creatorId = user.uid;
    this.creatorName = user.displayName;
    this.creatorPhone = user.phoneNumber;
  }
}
