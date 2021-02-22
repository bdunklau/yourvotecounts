import { FirebaseUserModel } from '../user/user.model';
import { Team } from './team.model';

export class TeamMember {

  teamMemberDocId: string;
  creatorId: string // creator of the team
  // user: FirebaseUserModel;
  created: firebase.firestore.Timestamp;
  userId: string;
  displayName: string;
  teamDocId: string;
  team_name: string;
  leader: boolean;

  // constructor(user: FirebaseUserModel) {
  //   this.user = user;
  // }

  constructor(obj: {teamMemberDocId: string,
                    creatorId: string, 
                    created: firebase.firestore.Timestamp,
                    teamDocId: string,
                    team_name: string,
                    userId: string,
                    displayName: string,
                    leader: boolean}) {
    this.teamMemberDocId = obj.teamMemberDocId;
    this.creatorId = obj.creatorId;
    this.created = obj.created;
    this.teamDocId = obj.teamDocId;
    this.team_name = obj.team_name;
    this.userId = obj.userId;
    this.displayName = obj.displayName;
    this.leader = obj.leader;
  }

  toObj(): any {
    return {teamMemberDocId: this.teamMemberDocId,
            creatorId: this.creatorId,
            teamDocId: this.teamDocId,
            created: this.created,
            team_name: this.team_name,
            userId: this.userId,
            displayName: this.displayName,
            leader: this.leader};
  }

  debug() {
    return this.displayName+' in team "'+this.team_name+'"'
  }
}
