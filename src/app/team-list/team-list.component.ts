import { Component, OnInit, Input, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { ActivatedRoute/*, CanActivate, RouterStateSnapshot, Router*/ } from '@angular/router';
import { TeamService } from '../team/team.service';
import { Team } from '../team/team.model';
import { TeamMember } from '../team/team-member.model';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { map, take } from 'rxjs/operators';
// import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../core/message.service';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../user/user.service';
import { LicenseService } from '../license/license.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css'],
  providers: [/*NgbActiveModal,*/ FirebaseUserModel]
})
export class TeamListComponent implements OnInit {

  // see teams.component.html
  @Input() teamListUser: FirebaseUserModel;
  @Output() selectedTeam = new EventEmitter<Team>();

  phoneVal: string;
  // teams: Team[];
  // teams: TeamMember[]; // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
  teams: {team_name: string, teamDocId: string}[]
  private subscription: Subscription;
  private memberSubscription: Subscription;
  canCreateTeam = false

  constructor(private route: ActivatedRoute,
              private teamService: TeamService,
              private userService: UserService,
              private licenseService: LicenseService,
              private messageService: MessageService,
              @Inject(PLATFORM_ID) private platformId,
              // private _modalService: NgbModal,
              teamListUser: FirebaseUserModel) {
    this.teamListUser = teamListUser;
  }

  async ngOnInit() {
      if(isPlatformBrowser(this.platformId)) {
          this.teams = [];
          // query team_member where userId = user.uid

          let user = await this.userService.getCurrentUser()
          this.canCreateTeam = await this.getCanCreateTeam(user)
          console.log('this.canCreateTeam = ', this.canCreateTeam)
          // if(user.access_expiration_ms > new Date().getTime())
          //     this.canCreateTeam = true

          let isAdmin = this.admin()
          this.normalUser(isAdmin)
      }
  }

  private admin() {
      if(!this.route.snapshot.params.all) return false
      this.subscription = this.teamService.getAllTeams().pipe(
        map(actions => {
          return actions.map(a => {
            const data:Team = a.payload.doc.data() as Team;
            // const id = a.payload.doc['id'];
            return {team_name: data.name, teamDocId: data.id};
          });
        })
      )
        .subscribe((objs: {team_name: string, teamDocId: string}[]) => {
          this.teams = objs
        });
      return true
  }

  private normalUser(isAdmin: boolean) {
      if(isAdmin) return
      this.subscription = this.teamService.getTeamsForUser(this.teamListUser.uid).pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as TeamMember;
            // const id = a.payload.doc['id'];
            // var returnThis = { id, ...data };
            // return returnThis;
            return {team_name: data.team_name, teamDocId: data.teamDocId};
          });
        })
      )
        .subscribe(objs => {
          // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
          this.teams = _.map(objs, obj => {
            let tm = obj as unknown;
            return tm as TeamMember;
          })
        });
  }

  // always unsubscribe
  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
    if(this.memberSubscription) this.memberSubscription.unsubscribe();
  }

  async getCanCreateTeam(user: FirebaseUserModel) {
      if(!user) return false
      if(user.isAdmin()) return true 
      // user already belongs to a team?  then no
      let teamsFound = await this.teamService.getTeamsForUser_snapshot(user.uid)
      if(teamsFound && teamsFound.length > 0) return false
      
      // if found in licensee_contact, then yes (because you don't belong to a team already (immediately above))
      let allowed = await this.licenseService.isLicenseeContact(user.phoneNumber)
      return allowed
  }

  // notice ngOnInit() - that's where we make this object TeamMember, not Team
  async edit(team_member: any /*json of a TeamMember*/) {
    let notFullyPopulated: Team = this.toTeam(team_member);
    console.log('notFullyPopulated = ', notFullyPopulated);
    let fullyPopulatedTeam = await this.teamService.getTeamData(notFullyPopulated.id);
    // console.log('team: ', fullyPopulatedTeam);

    this.selectedTeam.emit(fullyPopulatedTeam); // TODO get rid of this and use MessageService in  teams.component and team-member-editor.component


    // FIXME - I think instead we want to do this as soon as the team is created
    if(this.memberSubscription) this.memberSubscription.unsubscribe();
    console.log('fullyPopulatedTeam = ', fullyPopulatedTeam);
    this.memberSubscription = this.teamService.getMembers(fullyPopulatedTeam as Team).pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as TeamMember;
          return data;
          // const id = a.payload.doc['id'];
          // var returnThis = { id, ...data };
          // return returnThis;
        });
      })
    )
    .subscribe(team_members => {
      console.log('team_members = ', team_members);
      // this.messageService.updateTeamMembers(team_members); // only updates the client you're on - not that useful
    });

  }

  private toTeam(obj: any) {
    let team: Team = new Team();
    team.id = obj.teamDocId
    team.name = obj.team_name;
    return team;
  }

}
