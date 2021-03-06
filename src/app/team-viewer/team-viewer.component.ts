import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { Team } from '../team/team.model';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '../team/team.service';
import { map/*, take*/ } from 'rxjs/operators';
import { MessageService } from '../core/message.service';
import { TeamMember } from '../team/team-member.model';
import * as _ from 'lodash';
import { FirebaseUserModel } from '../user/user.model';
import { LogService } from '../log/log.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-team-viewer',
  templateUrl: './team-viewer.component.html',
  styleUrls: ['./team-viewer.component.css']
})
export class TeamViewerComponent implements OnInit {

  user: FirebaseUserModel;
  team: Team;
  private routeSubscription: Subscription;
  team_members: TeamMember[];
  private memberSubscription: Subscription;
  canEditTeam = false;
  canShowMembersAndVideos = false
  showMembers = true
  showVideos = false

  constructor(private route: ActivatedRoute,
              private teamService: TeamService,
              @Inject(PLATFORM_ID) private platformId,
              private messageService: MessageService,
              private log: LogService) { }

  ngOnInit() {
      if(isPlatformBrowser(this.platformId)) {

          // See TeamResolver and app-routing.module.ts for /teams/edit
          // You'll see that the team object below is created by TeamResolver
          this.routeSubscription = this.route.data.subscribe(routeData => {
            let user = routeData['user'];
            if (user) {
              this.user = user;
            }

            let team = routeData['team'];
            if (team) {
              this.team = team as Team;
              console.log('this.team = ', this.team);
              this.log.i('viewing team '+this.team.debug());
              //this.createForm(this.user.name);
              this.memberSubscription = this.teamService.getMembersByTeamId(team.id).pipe(
                map(actions => {
                  return actions.map(a => {
                    const data = a.payload.doc.data() as TeamMember;
                    const id = a.payload.doc['id'];
                    var returnThis = { id, ...data };
                    // console.log('returnThis = ', returnThis);
                    return returnThis;
                  });
                })
              )
                .subscribe(objs => {
                  // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
                  this.team_members = _.map(objs, obj => {
                    let tm = obj as unknown;
                    return tm as TeamMember;
                  });

                  // FIXME I'm querying for ALL team members just to see if I am a leader on that team
                  // ALSO HAVE 2 DATABASE READS GOING ON IN THE SAME PAGE - ONE IN THIS COMPONENT AND THE OTHER
                  // IN team-member-editor.component.ts THAT'S NOT GOOD
                  this.setTeamEditPermissions(this.user, this.team, this.team_members);
                });
            }

          })
      }
  }

  ngOnDestroy() {
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
    if(this.memberSubscription) this.memberSubscription.unsubscribe();
  }

  setTeamEditPermissions(user: FirebaseUserModel, team: Team, team_members: TeamMember[]) {
    if(!user || !team || !team_members) return false;
    this.canEditTeam = user.canEditTeam(team, team_members);
    this.canShowMembersAndVideos = this.canEditTeam || user.isAdmin()
  }

}
