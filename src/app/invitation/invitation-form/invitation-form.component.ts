import { Component, OnInit } from '@angular/core';
import { Invitation } from '../invitation.model';
import { NgForm, FormControl, /*FormControl, FormGroup*/ } from '@angular/forms';
import { Router } from "@angular/router";
import { InvitationService } from '../invitation.service';
import {
  AbstractControl ,
  FormGroup,
  FormArray,
  FormBuilder,
  Validators
} from "@angular/forms";
import { UserService } from '../../user/user.service';
import { SmsService } from '../../sms/sms.service';
import { FirebaseUserModel } from 'src/app/user/user.model';
import * as _ from 'lodash'



@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.css']
})
export class InvitationFormComponent implements OnInit {


  invitationForm: FormGroup;
  maxGuests = 2; // for now
  canInvite = true


  names: {
      displayName: string;
      phoneNumber: string;
  }[]

  //invitation: Invitation;
  invitations: Invitation[] = [];
  themessage: string;
  user: FirebaseUserModel;

  constructor(
    private smsService: SmsService,
    private fb: FormBuilder,
    private invitationService: InvitationService,
    private router: Router,
    private userService: UserService) { 

      this.createForm();
  }

  async ngOnInit(): Promise<void> {
    //this.arrayItems = [];
    //this.phones = []

    this.names = []
    this.addSomeone()

    //this.invitation = new Invitation();
    //this.invitation.id = this.invitationService.createId();
    this.user = await this.userService.getCurrentUser();
    //this.invitation.setCreator(this.user);

    // get the form started...

    // TODO FIXME temp - remove me
    //this.invitationForm.get("phone").setValue("2146325613") 
    //this.invitationForm.get("name").setValue("Brent")

    //this.invitation.phoneNumber = this.getPhoneNumber();

    // see:   https://stackoverflow.com/a/56058977
    //let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+this.invitation.id+"/"+this.invitation.phoneNumber};
    //this.themessage = await this.invitationService.getInvitationMessage(this.user.displayName, url);
    //this.invitationForm.get("message").setValue(this.themessage);
  }

  //  https://medium.com/aubergine-solutions/add-push-and-remove-form-fields-dynamically-to-formarray-with-reactive-forms-in-angular-acf61b4a2afe
  get nameArray() {
      return this.invitationForm.get('nameArray') as FormArray;
  }

  //  https://medium.com/aubergine-solutions/add-push-and-remove-form-fields-dynamically-to-formarray-with-reactive-forms-in-angular-acf61b4a2afe
 // get phoneArray() {
  //    return this.invitationForm.get('phoneArray') as FormArray;
  //}
  //  https://medium.com/aubergine-solutions/add-push-and-remove-form-fields-dynamically-to-formarray-with-reactive-forms-in-angular-acf61b4a2afe
  addSomeone() {
      this.names.push({displayName: '', phoneNumber: ''});
      let group = this.fb.group({
            displayName: new FormControl('', [Validators.required]),
            phoneNumber: new FormControl('', { validators: [Validators.required, this.ValidatePhone] /* DOES work   , updateOn: "blur" */ })
          } 
          //, { updateOn: 'blur' }  // another option
      )
      this.nameArray.push(group);
      console.log('this.nameArray: ', this.nameArray)
      this.canInvite = this.names.length < this.maxGuests
  }
  
  
  removeItem(i) {
      this.names.splice(i, 1)
      this.nameArray.removeAt(i);
      this.canInvite = this.names.length < this.maxGuests
  }

  createForm() {
    this.invitationForm = this.fb.group(
      {
        //name: ["", [Validators.required]],
        //phone: ["", { validators: [Validators.required, this.ValidatePhone], updateOn: "blur" }],
        //message: ["", [Validators.required]],
        ///////////////        
        nameArray: this.fb.array([]),
        //phoneArray: this.fb.array([])
      },
      // { updateOn: "blur" } <-- will apply to entire form
    );
  }

  doit() {


      for(var i=0; i < this.nameArray.length; i++) {
          console.log('this.nameArray.at(i).value: ', this.nameArray.at(i).value)
          this.names[i] = this.nameArray.at(i).value
      }
        
      console.log('this.nameArray: ', this.nameArray)
      console.log('this.names: ', this.names)
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
  
  ValidatePhone(control: AbstractControl): {[key: string]: any} | null  {
    console.log("validating phone")
    if (control.value && (control.value.length != 10 || isNaN(control.value)) ) {
      return { 'phoneNumberInvalid': true };
    }
    return null;
  }


  /*********
  getPhoneNumber(): string {
    if(!this.invitationForm.get("phone") || !this.invitationForm.get("phone").value)
        return // prevents weird error on submit "Cannot read property 'trim' of null"

    let ph = this.invitationForm.get("phone").value.trim();
    if(!ph.startsWith('+1'))
      ph = '+1'+ph;
    return ph;
  }
  ***********/
  

  async onSubmit(/*form: NgForm*/) {      

      // multiple invitation documents will all have this invitationId field
      let commonInvitationId = this.invitationService.createId();

      for(var i=0; i < this.nameArray.length; i++) {
          //console.log('this.nameArray.at(i).value: ', this.nameArray.at(i).value)
          this.names[i] = this.nameArray.at(i).value

          // create the invitation
          let invitation = new Invitation();
          invitation.id = commonInvitationId;
          invitation.setCreator(this.user);
          invitation.displayName = this.names[i].displayName
         
          //let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+invitation.id+"/"+this.names[i].phoneNumber};
          //this.themessage = this.getInvitationMessage(this.user.displayName, url);
          
          invitation.phoneNumber = "+1"+this.names[i].phoneNumber
          let url = `https://${window.location.host}/video-call/${invitation.id}/${invitation.phoneNumber}`
          let msg = `${invitation.creatorName} is inviting you to participate in a video call on SeeSaw.  Click the link below to see this invitation. \n\nDo not reply to this text message.  This number is not being monitored. \n\n${url}`
          invitation.message = msg
          console.log('invitation.message:  ', invitation.message)

          // don't think we have to await this before we send the sms
          this.invitationService.create(invitation);

          console.log('SMS COMMENTED OUT *****************')
          //this.smsService.sendSms({from: "+12673314843", to: invitation.phoneNumber, mediaUrl: "", message: invitation.message});
      }




      //this.invitation.displayName = this.invitationForm.get("name").value.trim();
      //this.invitation.message = this.invitationForm.get("message").value.trim();
      //this.invitation.phoneNumber = this.getPhoneNumber();
        
      //this.invitationService.create(this.invitation);

      //this.smsService.sendSms({from: "+12673314843", to: this.invitation.phoneNumber, mediaUrl: "", message: this.invitation.message});

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
      this.router.navigate(['/video-call', commonInvitationId, this.user.phoneNumber])
  }

  cancel(/*form: NgForm*/) {
    // this.editing.emit(false);
    this.invitationForm.reset();
  }


  
  /***********
  updateMessage() {
      console.log("updateMessage()")    
      let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+this.invitation.id+"/"+this.invitation.phoneNumber};
      this.themessage = this.getInvitationMessage(this.user.displayName, url);
      this.invitationForm.get("message").setValue(this.themessage);
  }


  getInvitationMessage(displayName: string, parm: {protocol: string, host: string, pathname: string}) {
    let baseMsg = 'name  is inviting you to participate in a video call on SeeSaw.  Click the link below to see this invitation. \n\n url \n\n Do not reply to this text message.  This number is not being monitored.'
    //var res = await this.afs.collection('config').doc('invitation_template').ref.get();
    let msg = baseMsg.replace(/name/, displayName);
    //let host = parm.host.indexOf("localhost") == -1 ? parm.host : this.ngrok
    //let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+this.invitation.id+"/"+this.invitation.phoneNumber};
    
    this.invitation.phoneNumber = this.getPhoneNumber();
    let url = `${parm.protocol}//${parm.host}/video-call/${this.invitation.id}/${this.invitation.phoneNumber}`

    //this.themessage = await this.invitationService.getInvitationMessage(this.user.displayName, url);
    //let url = parm.protocol+"//"+parm.host+parm.pathname
    msg = msg.replace(/url/, url);
    msg = msg.replace(/\\n/g, "\n");
    return msg;
  }


  getUrl(protocol: string, host: string, pathname: string) {
    return `${protocol}//${host}`
  }
  *******/

}
