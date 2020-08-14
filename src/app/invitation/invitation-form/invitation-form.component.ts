import { Component, OnInit } from '@angular/core';
import { Invitation } from '../invitation.model';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';
import { Router } from "@angular/router";
import { InvitationService } from '../invitation.service';
import {
  AbstractControl ,
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
} from "@angular/forms";
import { UserService } from '../../user/user.service';


@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.css']
})
export class InvitationFormComponent implements OnInit {

  invitationForm: FormGroup;
  invitation: Invitation;
  themessage: string;

  constructor(
    private fb: FormBuilder,
    private invitationService: InvitationService,
    private router: Router,
    private userService: UserService) { }

  ngOnInit(): void {
    this.invitation = new Invitation();
    this.createForm();
    this.userService.getCurrentUser().then(user => {
      this.themessage = user.displayName+" is inviting you to participate in a video call with him on SeeSaw.  Click the link below to see this invitation."
      console.log('themessage = ', this.themessage)
      this.invitationForm.get("message").setValue(this.themessage);
    })
  }
  
  get name() {
    return this.invitationForm.get("name");
  }

  get phone() {
    return this.invitationForm.get("phone");
  }

  get message() {
    return this.invitationForm.get("message");
  }

  createForm() {
    this.invitationForm = this.fb.group(
      {
        name: ["", [Validators.required]],
        phone: ["", { validators: [Validators.required, this.ValidatePhone], updateOn: "blur" }],
        message: ["", [Validators.required]],
      },
      // { updateOn: "blur" } <-- will apply to entire form
    );
  }
  
  ValidatePhone(control: AbstractControl): {[key: string]: any} | null  {
    if (control.value && (control.value.length != 10 || isNaN(control.value)) ) {
      return { 'phoneNumberInvalid': true };
    }
    return null;
  }
  

  onSubmit(/*form: NgForm*/) {
    var invitationId = null;
    //if(this.teamIdValue) this.team.id = this.teamIdValue;
    this.invitation.displayName = this.invitationForm.get("name").value.trim();
    this.invitation.phoneNumber = this.invitationForm.get("phone").value.trim();
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
    this.invitationForm.reset();
  }

  cancel(/*form: NgForm*/) {
    // this.editing.emit(false);
    this.invitationForm.reset();
  }

}
