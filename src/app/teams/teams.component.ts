import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';
import * as _ from 'lodash';
import { ActivatedRoute/*, CanActivate, RouterStateSnapshot, Router*/ } from '@angular/router';
import { Team } from '../team/team.model';
import { /*Subject, Observable*/ Subscription } from 'rxjs';


@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  user: FirebaseUserModel;
  team: Team;

  constructor(private userService: UserService,
              @Inject(PLATFORM_ID) private platformId,
              private route: ActivatedRoute) { }

  ngOnInit() {
      
      if(isPlatformBrowser(this.platformId)) {
          this.userService.getCurrentUser().then(user => {
            this.user = user;
          });
      }
  }

  ngOnDestroy() {
  }


  startCreatingTeam() {
    this.team = new Team();
  }


  /**
   * video-call.component.ts : onInvitationsSent() 
   */
  onTeamSelected(team: Team) {
    // console.log('onSelectedTeam: team: ', team);
    this.team = team;
  }

  onEditStateChange(editing: boolean) {
    if(!editing) delete this.team;
  }

}
