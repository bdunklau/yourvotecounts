import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FirebaseUserModel } from '../user/user.model';
import { TeamMember } from '../team/team-member.model';
import { Team } from '../team/team.model';
import { Invitation } from '../invitation/invitation.model'
import { CommitteeService } from '../civic/committees/committee.service';
import { Committee } from '../civic/officials/view-official/view-official.component';
import { Licensee } from '../license/licensee/licensee.model';
import { LicenseeContact } from '../license/licensee-contact/licensee-contact.model';


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  // private myMessage = new Subject<string>();
  private userListener = new Subject<FirebaseUserModel>();
  private recordingStatusListener = new Subject<string>();
  private hostJoinedListener = new Subject<number>(); // number is timestamp
  private timerEvents = new Subject<string>()
  // private team_members = new Subject<TeamMember[]>();
  // private updated_member = new Subject<TeamMember>();
  // private removed_member = new Subject<TeamMember>();
  // private team_member = new Subject<TeamMember>();
  private team = new Subject<Team>();
  private invitationListener = new Subject<Invitation[]>();
  private committeeSelectionListener = new Subject<Committee>()
  private vmState = new Subject<boolean>();
  private licenseeListener = new Subject<Licensee>()
  private licenseeContactListener = new Subject<LicenseeContact>()

  constructor() { }

  // getMessage(): Observable<string> {
  //    return this.myMessage.asObservable();
  // }
  //
  // updateMessage(message: string) {
  //   this.myMessage.next(message);
  // }

  // addTeamMember(team_member: TeamMember) {
  //   this.team_member.next(team_member);
  // }

  // deleteTeamMember(team_member: TeamMember) {
  //   this.removed_member.next(team_member);
  // }

  // getRemovedMember(): Observable<TeamMember> {
  //   return this.removed_member.asObservable();
  // }

  getTeam(): Observable<Team> {
    return this.team.asObservable();
  }

  // getTeamMember(): Observable<TeamMember> {
  //   return this.team_member.asObservable();
  // }

  // getTeamMembers(): Observable<TeamMember[]> {
  //   return this.team_members.asObservable();
  // }

  // getTeamMemberUpdates(): Observable<TeamMember> {
  //   return this.updated_member.asObservable();
  // }

  getUser(): Observable<FirebaseUserModel> {
     return this.userListener.asObservable();
  }

  // updateTeam(team: Team) {
  //   this.team.next(team);
  // }

  // updateTeamMember(team_member: TeamMember) {
  //   this.updated_member.next(team_member);
  // }

  // updateTeamMembers(team_members: TeamMember[]) {
  //   this.team_members.next(team_members);
  // }


  /**
   * Called from video-call.component.ts so we can keep track of elapsed time and warn the users
   * when they get close to settings.max_call_time (secs)
   * 
   * DON'T NEED THIS BECAUSE EVERYTHING HAPPENS IN video-call.component.ts
   */
  // hostJoined(timestamp: number) {
  //     this.hostJoinedListener.next(timestamp)
  // }

  // listenForHostJoining() {
  //     return this.hostJoinedListener
  // }


  listenForVmState() {
      return this.vmState
  }

  updateVmState(state: boolean) {
      this.vmState.next(state)
  }


  // see  recording-indicator.component.ts
  listenForRecordingStatus() {
      return this.recordingStatusListener
  }

  // see  video-call.component.ts
  updateRecordingStatus(status: string) {
      this.recordingStatusListener.next(status)
  }



  listenForUser() {
    return this.userListener;
  }

  updateUser(user: FirebaseUserModel) {
    this.userListener.next(user);
  }



  /**
   * video-call.component.ts
   */
  listenForTimerEvents() {
      return this.timerEvents
  }

  /**
   * timer.component.ts 
   */
  timerEvent(event: string) {
      this.timerEvents.next(event)
  }


  setCurrentInvitations(invitations: Invitation[]) {
      this.invitationListener.next(invitations)
  }

  /**
   * invitation-form.component.ts
   */
  listenForInvitations() {
      return this.invitationListener
  }


  setCurrentCommittee(committee: Committee) {
      this.committeeSelectionListener.next(committee)
  }


  listenForCommitteeSelection() {
      return this.committeeSelectionListener
  }


  setCurrentLicensee(licensee: Licensee) {
      return this.licenseeListener.next(licensee)
  }


  listenForLicensee() {
      return this.licenseeListener
  }


  setCurrentLicenseeContact(licenseeContact: LicenseeContact) {
      return this.licenseeContactListener.next(licenseeContact)
  }


  listenForLicenseeContact() {
      return this.licenseeContactListener
  }

}
