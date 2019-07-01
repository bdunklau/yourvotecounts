import { Component, OnInit, Input } from '@angular/core';
import { Team } from '../team/team.model';
import { TeamService } from '../team/team.service';
import * as firebase from 'firebase/app';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';
import { TeamMember } from '../team/team-member.model';

@Component({
  selector: 'app-team-editor',
  templateUrl: './team-editor.component.html',
  styleUrls: ['./team-editor.component.css']
})
export class TeamEditorComponent implements OnInit {

  editing: boolean;
  teamNameValue: string;
  teamIdValue: string;
  @Input() user: FirebaseUserModel;

  constructor(private teamService: TeamService,
              private userService: UserService) { }

  ngOnInit() {
    this.editing = false;
  }

  onSubmit() {
    this.editing = false;
    if(!this.teamIdValue) {
      this.teamService.create(this.teamNameValue, this.user);
    }
    else
      this.teamService.update(this.teamIdValue, this.teamNameValue, this.user);
  }

}
