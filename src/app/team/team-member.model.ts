import { FirebaseUserModel } from '../user/user.model';
import { Team } from './team.model';

export class TeamMember {

  teamMemberDocId: string;
  access_expiration_ms: number
  creatorId: string // creator of the team
  // user: FirebaseUserModel;
  created: firebase.firestore.Timestamp;
  userId: string;
  displayName: string;
  teamDocId: string;
  team_name: string;
  leader: boolean;
  phoneNumber: string

  // constructor(user: FirebaseUserModel) {
  //   this.user = user;
  // }

  constructor(obj: {teamMemberDocId: string,
                    access_expiration_ms: number,
                    creatorId: string, 
                    created: firebase.firestore.Timestamp,
                    teamDocId: string,
                    team_name: string,
                    userId: string,
                    displayName: string,
                    phoneNumber: string,
                    leader: boolean}) {
    this.teamMemberDocId = obj.teamMemberDocId;
    this.access_expiration_ms = obj.access_expiration_ms
    this.creatorId = obj.creatorId;
    this.created = obj.created;
    this.teamDocId = obj.teamDocId;
    this.team_name = obj.team_name;
    this.userId = obj.userId;
    this.displayName = obj.displayName;
    this.leader = obj.leader;
    this.phoneNumber = obj.phoneNumber;
  }

  toObj(): any {
    return {teamMemberDocId: this.teamMemberDocId,
            access_expiration_ms: this.access_expiration_ms,
            creatorId: this.creatorId,
            teamDocId: this.teamDocId,
            created: this.created,
            team_name: this.team_name,
            userId: this.userId,
            displayName: this.displayName,
            phoneNumber: this.phoneNumber,
            leader: this.leader};
  }

  debug() {
    return this.displayName+' in team "'+this.team_name+'"'
  }
}
