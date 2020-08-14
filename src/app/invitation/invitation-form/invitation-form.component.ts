import { Component, OnInit } from '@angular/core';
import { Invitation } from '../invitation.model';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';
import { Router } from "@angular/router";
import { InvitationService } from '../invitation.service';


@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.css']
})
export class InvitationFormComponent implements OnInit {

  invitation: Invitation;
  nameValue: string;
  phoneValue: string;

  constructor(
    private invitationService: InvitationService,
    private router: Router,) { }

  ngOnInit(): void {
    this.invitation = new Invitation();
  }
  

  onSubmit(form: NgForm) {
    var invitationId = null;
    //if(this.teamIdValue) this.team.id = this.teamIdValue;
    this.invitation.displayName = this.nameValue.trim();
    this.invitation.phoneNumber = this.phoneValue.trim();
    if(!this.invitation.phoneNumber.startsWith('+1'))
      this.invitation.phoneNumber = '+1'+this.invitation.phoneNumber;
    
    // will always be true
    if(!this.invitation.id) {
      invitationId = this.invitationService.create(this.invitation);
    }

    /***** don't update invitations - just cancel and reissue
    else {
      this.teamService.update(this.team);
      teamId = this.team.id;
    }
    *****/
    //this.router.navigate(['/teams', teamId]);
    form.reset();
  }

  cancel(form: NgForm) {
    // this.editing.emit(false);
    form.reset();
  }

}
