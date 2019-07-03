import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';
import * as _ from 'lodash';
import { ActivatedRoute/*, CanActivate, RouterStateSnapshot, Router*/ } from '@angular/router';
import { Team } from '../team/team.model';


@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  user: FirebaseUserModel;
  team: Team;

  constructor(private userService: UserService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.userService.getCurrentUser().then(user => {
      this.user = user;
      // if(this.user) {
      //   const id = this.route.snapshot.paramMap.get('teamDocId');
      //   if(id) {
      //     this.team = _.find(this.user.teams, function(team) {return team.id == id});
      //     console.log('this.team = ', this.team);
      //   }
      // }
    });
  }


  startCreatingTeam() {
    this.team = new Team();
  }


  onTeamSelected(team: Team) {
    console.log('onSelectedTeam: team: ', team);
    this.team = team;
  }

  onEditStateChange(editing: boolean) {
    if(!editing) delete this.team;
  }

}
