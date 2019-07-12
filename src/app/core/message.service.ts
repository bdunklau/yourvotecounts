import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FirebaseUserModel } from '../user/user.model';
import { TeamMember } from '../team/team-member.model';
import { Team } from '../team/team.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  // private myMessage = new Subject<string>();
  private user = new Subject<FirebaseUserModel>();
  private team_members = new Subject<TeamMember[]>();
  private removed_member = new Subject<TeamMember>();
  private team_member = new Subject<TeamMember>();
  private team = new Subject<Team>();

  constructor() { }

  // getMessage(): Observable<string> {
  //    return this.myMessage.asObservable();
  // }
  //
  // updateMessage(message: string) {
  //   this.myMessage.next(message);
  // }

  addTeamMember(team_member: TeamMember) {
    this.team_member.next(team_member);
  }

  deleteTeamMember(team_member: TeamMember) {
    this.removed_member.next(team_member);
  }

  getRemovedMember(): Observable<TeamMember> {
    return this.removed_member.asObservable();
  }

  getTeam(): Observable<Team> {
    return this.team.asObservable();
  }

  getTeamMember(): Observable<TeamMember> {
    return this.team_member.asObservable();
  }

  getTeamMembers(): Observable<TeamMember[]> {
    return this.team_members.asObservable();
  }

  getUser(): Observable<FirebaseUserModel> {
     return this.user.asObservable();
  }

  updateTeam(team: Team) {
    this.team.next(team);
  }

  updateTeamMembers(team_members: TeamMember[]) {
    this.team_members.next(team_members);
  }

  updateUser(user: FirebaseUserModel) {
    this.user.next(user);
  }

}
