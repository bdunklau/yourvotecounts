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
import { FirebaseUserModel } from 'src/app/user/user.model';



@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.css']
})
export class InvitationFormComponent implements OnInit {

  invitationForm: FormGroup;
  invitation: Invitation;
  themessage: string;
  user: FirebaseUserModel;

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
    this.user = await this.userService.getCurrentUser();
    this.invitation.setCreator(this.user);

    // TODO FIXME temp - remove me
    this.invitationForm.get("phone").setValue("2146325613") 
    this.invitationForm.get("name").setValue("Brent")

    this.invitation.phoneNumber = this.getPhoneNumber();

    // see:   https://stackoverflow.com/a/56058977
    let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+this.invitation.id+"/"+this.invitation.phoneNumber};
    this.themessage = await this.invitationService.getInvitationMessage(this.user.displayName, url);
    this.invitationForm.get("message").setValue(this.themessage);
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


  getPhoneNumber(): string {
    let ph = this.invitationForm.get("phone").value.trim();
    if(!ph.startsWith('+1'))
      ph = '+1'+ph;
    return ph;
  }
  

  async onSubmit(/*form: NgForm*/) {
    this.invitation.displayName = this.invitationForm.get("name").value.trim();
    this.invitation.message = this.invitationForm.get("message").value.trim();
    this.invitation.phoneNumber = this.getPhoneNumber();
      
    this.invitationService.create(this.invitation);

    console.log('this.invitation = ', this.invitation);
    console.log('this.invitation.creatorName = ', this.invitation.creatorName);
    console.log('this.invitation.creatorPhone = ', this.invitation.creatorPhone);
    console.log('this.invitation.phoneNumber = ', this.invitation.phoneNumber);
    this.smsService.sendSms({from: "+12673314843", to: this.invitation.phoneNumber, mediaUrl: "", message: this.invitation.message});

    /***** don't update invitations - just cancel and reissue  *****/
    //this.router.navigate(['/teams', teamId]);
    this.invitationForm.reset();

    // WAIT - not this exactly.  Instead what we want to do is send the host a text message also
    // with a similar url as the guest, only containing the host's phone number.  
    // The text will say something like "Click the link below when you are ready to begin hosting this video call
    // with [guest]"
    // be sure to use the current user's phone number here, not the guest's
    //
    // We should probably create the /video-call link now and copy all the code from /invitation-details
    // over to /video-call.  THEN we can send the host at the end of this method to the repurposed
    // /invitation-details page, where we tell him about the invitation he just sent - sort of like a
    // receipt.   The page should contain the name and number of the person invited and also a link to
    // revoke the invitation.
    //
    this.router.navigate(['/invitation-details', this.invitation.id, this.user.phoneNumber])
  }

  cancel(/*form: NgForm*/) {
    // this.editing.emit(false);
    this.invitationForm.reset();
  }

}
