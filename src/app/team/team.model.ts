import { TeamMember } from './team-member.model';
import * as _ from 'lodash';
import { FirebaseUserModel } from '../user/user.model';

// Generate model classes with ng cli like this:
// ng generate class team/team --type=model
export class Team {
  name: string;
  created: Date;
  creatorId: string;
  creatorName: string;
  creatorPhone: string;
  members: TeamMember[];
  memberCount = 0;

  constructor() {
    this.members = [];
  }

  toObj(): any {
    return {name: this.name,
          created: this.created,
          creatorId: this.creatorId,
          creatorName: this.creatorName,
          creatorPhone: this.creatorPhone,
          members: _.map(this.members, teamMember => teamMember.toObj())};
  }

  setCreator(user: FirebaseUserModel) {
    this.creatorId = user.uid;
    this.creatorName = user.displayName;
    this.creatorPhone = user.phoneNumber;
  }
}
