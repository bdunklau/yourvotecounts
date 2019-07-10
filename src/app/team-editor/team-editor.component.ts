import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Team } from '../team/team.model';
import { TeamService } from '../team/team.service';
import * as firebase from 'firebase/app';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';
import { TeamMember } from '../team/team-member.model';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';

@Component({
  selector: 'app-team-editor',
  templateUrl: './team-editor.component.html',
  styleUrls: ['./team-editor.component.css'],
})
export class TeamEditorComponent implements OnInit {

  // editing: boolean;
  @Input() teamNameValue: string;
  @Input() teamIdValue: string;
  @Input() user: FirebaseUserModel;
  @Output() editing = new EventEmitter<boolean>();
  // teamForm = new FormGroup({
  //   teamId: new FormControl(''),
  //   teamName: new FormControl(''),
  // });

  constructor(private teamService: TeamService,
              private userService: UserService) { }

  ngOnInit() {
    // this.editing = false;
  }

  cancelEditing(form: NgForm) {
    this.editing.emit(false);
    form.reset();
  }

  onSubmit(form: NgForm) {
    // this.editing = false;
    // console.log('onSubmit:  this.user = ', this.user);
    if(!this.teamIdValue) {
      this.teamService.create(this.teamNameValue, this.user);
    }
    else
      this.teamService.update(this.teamIdValue, this.teamNameValue, this.user);
    form.reset();
  }

  // private clearFields() {
  //   this.teamNameValue = '';
  //   this.teamIdValue = '';
  // }

}
