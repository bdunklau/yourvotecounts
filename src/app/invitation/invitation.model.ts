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
    
    constructor() {}
    

  setCreator(user: FirebaseUserModel) {
    this.creatorId = user.uid;
    this.creatorName = user.displayName;
    this.creatorPhone = user.phoneNumber;
  }
}
