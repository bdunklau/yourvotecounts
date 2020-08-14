import { Component, OnInit } from '@angular/core';
import { Invitation } from '../invitation.model';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';


@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.css']
})
export class InvitationFormComponent implements OnInit {

  invitation: Invitation;
  nameValue: string;
  phoneValue: string;

  constructor() { }

  ngOnInit(): void {
    this.invitation = new Invitation();
  }
  

  onSubmit(form: NgForm) {
    var invitationId = null;
    //if(this.teamIdValue) this.team.id = this.teamIdValue;
    this.invitation.displayName = this.nameValue.trim();
    if(!this.invitation.id) {
      invitationId = this.invitationService.create(this.invitation);
    }
    else {
      this.teamService.update(this.team);
      teamId = this.team.id;
    }
    this.router.navigate(['/teams', teamId]);
    form.reset();
  }

}
