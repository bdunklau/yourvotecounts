import { TeamMember } from './team-member.model';
import * as _ from 'lodash';
import { FirebaseUserModel } from '../user/user.model';
import * as firebase from 'firebase/app';

// Generate model classes with ng cli like this:
// ng generate class team/team --type=model
export class Team {
  id: string; // the doc id
  name: string;
  created: firebase.firestore.Timestamp; //Date;
  creatorId: string;
  creatorName: string;
  creatorPhone: string;
  memberCount = 0;
  leaderCount = 0;

  constructor() {
  }

  toObj(): any {
    return {id: this.id,
          name: this.name,
          created: this.created,
          creatorId: this.creatorId,
          creatorName: this.creatorName,
          creatorPhone: this.creatorPhone,
          memberCount: this.memberCount,
          leaderCount: this.leaderCount};
  }

  setCreator(user: FirebaseUserModel) {
    this.creatorId = user.uid;
    this.creatorName = user.displayName;
    this.creatorPhone = user.phoneNumber;
  }
}
