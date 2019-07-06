import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FirebaseUserModel } from '../user/user.model';
import { TeamMember } from '../team/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  // private myMessage = new Subject<string>();
  private user = new Subject<FirebaseUserModel>();
  private team_members = new Subject<Team>();

  constructor() { }

  // getMessage(): Observable<string> {
  //    return this.myMessage.asObservable();
  // }
  //
  // updateMessage(message: string) {
  //   this.myMessage.next(message);
  // }

  getTeamMembers(): Observable<TeamMember[]> {
    return this.team_members.asObservable();
  }

  getUser(): Observable<FirebaseUserModel> {
     return this.user.asObservable();
  }

  updateTeamMembers(team_members: TeamMember[]) {
    this.team_members.next(team_members);
  }

  updateUser(user: FirebaseUserModel) {
    this.user.next(user);
  }

}
