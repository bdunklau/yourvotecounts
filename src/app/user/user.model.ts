import * as _ from 'lodash';
import { Team } from '../team/team.model';
import { TeamMember } from '../team/team-member.model';

export class FirebaseUserModel {
  uid: string; // the doc id
  image: string;
  displayName: string;
  displayName_lower: string;
  provider: string;
  phoneNumber: string;
  roles: Array<String>;
  photoURL: string;
  date_ms: number;
  // teams: Team[];

  constructor(){
    this.uid = "";
    this.image = "";
    this.displayName = "";
    this.displayName_lower = "";
    this.provider = "";
    this.phoneNumber = "";
    this.roles = [];
    this.photoURL = "";
    // this.teams = [];
  }

  populate(obj) {
    this.uid = obj.uid;
    this.image = obj.image;
    this.displayName = obj.displayName;
    this.displayName_lower = obj.displayName_lower;
    this.provider = obj.provider;
    this.phoneNumber = obj.phoneNumber;
    this.roles = obj.roles;
    this.photoURL = obj.photoURL;
    // this.teams = obj.teams ? obj.teams : [];
    // console.log('populate():  this.teams = ', this.teams);
  }

  // getTeams() {
  //   return this.teams;
  // }

  hasRole(role: string): boolean {
    var idx = _.findIndex(this.roles, function(o) { return o == role; });
    return idx != -1
  }

  canAddTeamMembers(team: Team, team_members: TeamMember[]): boolean {
    return this.canRemoveTeamMembers(team, team_members);
  }

  canRemoveTeamMembers(team: Team, team_members: TeamMember[]): boolean {
    var findMe = _.find(team_members, {userId: this.uid});
    if(!findMe) {
      console.log('return false because findMe is undef')
      return false;
    }
    var val = findMe.leader;
    console.log('return findMe.leader = ', findMe.leader);
    return val;
  }

  canSetLeaders(team: Team, team_members: TeamMember[]): boolean {
    return this.canRemoveTeamMembers(team, team_members);
  }
}
