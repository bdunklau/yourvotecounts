import { TeamMember } from './team-member.model';
import * as _ from 'lodash';
import { FirebaseUserModel } from '../user/user.model';
import * as firebase from 'firebase/app';

// Generate model classes with ng cli like this:
// ng generate class team/team --type=model
export class Team {
  id: string; // the doc id
  access_expiration_ms: number
  name: string;
  created: firebase.firestore.Timestamp; //Date;
  creatorId: string;
  creatorName: string;
  creatorPhone: string;
  memberCount = 0;
  leaderCount = 0;
  views = 0
  totalTime = 0

  constructor() {
  }

  toObj(): any {
    return {id: this.id,
          access_expiration_ms: this.access_expiration_ms,
          name: this.name,
          created: this.created,
          creatorId: this.creatorId,
          creatorName: this.creatorName,
          creatorPhone: this.creatorPhone,
          memberCount: this.memberCount,
          leaderCount: this.leaderCount,
          views: this.views,
          totalTime: this.totalTime};
  }

  /**
   * HAVE TO MODIFY toObj() also if you add stuff here
   */
  setCreator(user: FirebaseUserModel) {
    this.access_expiration_ms = user.access_expiration_ms
    this.creatorId = user.uid;
    this.creatorName = user.displayName;
    this.creatorPhone = user.phoneNumber;
  }

  debug() {
    return ' "'+this.name+'"'
  }
}
