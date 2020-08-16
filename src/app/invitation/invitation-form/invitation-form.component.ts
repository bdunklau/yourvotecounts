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
import { SmsService } from '../../sms/sms.service';
import * as firebase from 'firebase/app';



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
    private smsService: SmsService,
    private fb: FormBuilder,
    private invitationService: InvitationService,
    private router: Router,
    private userService: UserService) { }

  async ngOnInit(): Promise<void> {
    this.invitation = new Invitation();
    this.invitation.id = this.invitationService.createId();
    this.createForm();
    let user = await this.userService.getCurrentUser();
    // see:   https://stackoverflow.com/a/56058977
    let url = {protocol: window.location.protocol, host: window.location.host, pathname: "/invitation-details/"+this.invitation.id}
    this.themessage = await this.invitationService.getInvitation(user.displayName, url);
    this.invitationForm.get("message").setValue(this.themessage);

    // TODO FIXME temp - remove me
    this.invitationForm.get("phone").setValue("2146325613") 
    this.invitationForm.get("name").setValue("Brent")
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
  

  async onSubmit(/*form: NgForm*/) {
    this.invitation.displayName = this.invitationForm.get("name").value.trim();
    this.invitation.phoneNumber = this.invitationForm.get("phone").value.trim();
    this.invitation.message = this.invitationForm.get("message").value.trim();
    if(!this.invitation.phoneNumber.startsWith('+1'))
      this.invitation.phoneNumber = '+1'+this.invitation.phoneNumber;

    this.invitation.created = firebase.firestore.Timestamp.now();
    const user = await this.userService.getCurrentUser();
    this.invitation.setCreator(user);
    //this.invitation.creatorPhone = "+12673314843";
      
    this.invitationService.create(this.invitation);

    console.log('this.invitation = ', this.invitation);
    console.log('this.invitation.creatorName = ', this.invitation.creatorName);
    console.log('this.invitation.creatorPhone = ', this.invitation.creatorPhone);
    console.log('this.invitation.phoneNumber = ', this.invitation.phoneNumber);
    this.smsService.sendSms({from: "+12673314843", to: this.invitation.phoneNumber, mediaUrl: "", message: this.invitation.message});

    /***** don't update invitations - just cancel and reissue  *****/
    //this.router.navigate(['/teams', teamId]);
    this.invitationForm.reset();
  }

  cancel(/*form: NgForm*/) {
    // this.editing.emit(false);
    this.invitationForm.reset();
  }

}
