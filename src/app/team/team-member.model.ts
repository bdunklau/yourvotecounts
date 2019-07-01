import { FirebaseUserModel } from '../user/user.model';

export class TeamMember {

  user: FirebaseUserModel;
  leader: boolean;

  constructor(user: FirebaseUserModel) {
    this.user = user;
  }

  setTeamLeader(leader: boolean) {
    this.leader = leader;
  }

  toObj(): any {
    return {userId: this.user.uid,
            displayName: this.user.displayName,
            phoneNumber: this.user.phoneNumber,
            leader: this.leader};
  }
}
