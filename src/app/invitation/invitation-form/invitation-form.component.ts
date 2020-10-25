import { Component, OnInit, OnDestroy, OnChanges, Inject, PLATFORM_ID, Input, Output, EventEmitter } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
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
import { SettingsService } from 'src/app/settings/settings.service';
import { MessageService } from 'src/app/core/message.service';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';



@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.css']
})
export class InvitationFormComponent implements OnInit {

  // see  video-call.component.html
  // @Input() inputInviteId: string
  // @Input() inputInvitationCount = 0
  @Output() outputInvitations = new EventEmitter<Invitation>();
  private currentInviteCount = 0
  private invitationIdSub: Subscription
  private currentInvitations: Invitation[]

  invitationForm: FormGroup;
  maxGuests: number
  numberOfInvitationsRemaining: number
  canInvite = true
  translated = false


  names: {
      displayName: string;
      phoneNumber: string;
  }[]

  //invitation: Invitation;
  invitations: Invitation[] = [];
  themessage: string;
  user: FirebaseUserModel;
  host: string;  //also includes port

  constructor(
    private smsService: SmsService,
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private invitationService: InvitationService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private messageService: MessageService,
    //@Optional() @Inject(REQUEST) private request: any,
    private userService: UserService) { 

      // will be something if this is called from video-call.component.ts
      this.createForm();
  }

  async ngOnInit(): Promise<void> {
    
    // if (isPlatformServer(this.platformId)) {
    //     this.host = this.request.headers['x-forwarded-host'] // this is just the name of the server/host
    //     console.log('InvitationFormComponent: x-forwarded-host:  ', this.request.headers['x-forwarded-host'])
    // }


    // we don't want this - we want config/settings/website_domain_name
    if (isPlatformBrowser(this.platformId)) {
        this.maxGuests = this.settingsService.maxGuests
        this.currentInviteCount = this.currentInvitations ? this.currentInvitations.length : 0
        this.numberOfInvitationsRemaining = this.maxGuests - this.currentInviteCount
        this.host = window.location.host //this.settingsService.settings.website_domain_name
        console.log('InvitationFormComponent: isPlatformBrowser: true: window.location.host = ', window.location.host)

        // this.canInvite = this.canInviteMore()
        this.names = []
        this.addSomeone()
    
        this.user = await this.userService.getCurrentUser();
        this.listenForInvitations();
    }


  }

  ngOnDestroy() {
      if(this.invitationIdSub) this.invitationIdSub.unsubscribe()
  }

  listenForInvitations() {
      var iii = function(invitations: Invitation[]) { 
          this.currentInvitations = invitations 
          this.currentInviteCount = this.currentInvitations ? this.currentInvitations.length : 0
          this.numberOfInvitationsRemaining = this.maxGuests - this.currentInviteCount
          this.canInvite = this.canInviteMore()
          console.log('listenForInvitations():  this.currentInvitations = ', this.currentInvitations)
      }.bind(this)
      // this.invitationIdSub = 
      this.invitationIdSub = this.messageService.listenForInvitations().subscribe({
          next: iii, 
          error: () => {}, 
          complete: () => {}
      })
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
            phoneNumber: new FormControl('', { validators: [Validators.required, this.ValidatePhone.bind(this)] /* DOES work   , updateOn: "blur" */ })
          } 
          //, { updateOn: 'blur' }  // another option
      )
      this.nameArray.push(group);
      console.log('this.nameArray: ', this.nameArray)
      this.canInvite = this.canInviteMore()
  }
  
  
  removeItem(i) {
      this.names.splice(i, 1)
      this.nameArray.removeAt(i);
      this.canInvite = this.canInviteMore()
  }

  canInviteMore() {
      return this.names.length < /*this.maxGuests - */this.numberOfInvitationsRemaining /* + 1 */
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
      console.log('ValidatePhone(): control.value = ', control.value)
      console.log('ValidatePhone(): this = ', this)
      if(!control || !control.value) return null
      let myString = this.justNumbers(control.value)      
      if (myString && (myString.length != 10) ) {
        return { 'phoneNumberInvalid': true };
      }
      return null;
  }

  justNumbers(value: string) {
      console.log('justNumbers(): value = ', value)
      let replaced = value.replace(/\D/g,''); //  \D = all non-digits 
      return replaced
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
      let commonInvitationId = this.currentInvitations && this.currentInvitations.length > 0 ? this.currentInvitations[0].invitationId : this.invitationService.createId();

      for(var i=0; i < this.nameArray.length; i++) {
          //console.log('this.nameArray.at(i).value: ', this.nameArray.at(i).value)
          this.names[i] = this.nameArray.at(i).value

          // create the invitation
          let invitation = new Invitation();
          invitation.invitationId = commonInvitationId;
          invitation.setCreator(this.user);
          invitation.displayName = this.names[i].displayName
         
          //let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+invitation.invitationId+"/"+this.names[i].phoneNumber};
          //this.themessage = this.getInvitationMessage(this.user.displayName, url);
          
          invitation.phoneNumber = "+1" + this.justNumbers(this.names[i].phoneNumber)
          // TODO FIXME figure out host name
          let url = `https://${this.host}/video-call/${invitation.invitationId}/${invitation.phoneNumber}`
          let msg = `${invitation.creatorName} is inviting you to participate in a video call on HeadsUp.  Click the link below to see this invitation. \n\nDo not reply to this text message.  This number is not being monitored. \n\n${url}`
          invitation.message = msg
          console.log('invitation.message:  ', invitation.message)

          // don't think we have to await this before we send the sms
          this.invitationService.create(invitation);

          this.outputInvitations.emit(invitation)

          //console.log('SMS COMMENTED OUT *****************')
          this.smsService.sendSms({from: "+12673314843", to: invitation.phoneNumber, mediaUrl: "", message: invitation.message});
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
  
  validatePhoneNo(field) {
      var phoneNumDigits = field.value.replace(/\D/g, '');
    
      // this.isValidFlg = (phoneNumDigits.length==0 || phoneNumDigits.length == 10);
    
      var formattedNumber = phoneNumDigits;
      if (phoneNumDigits.length >= 6)
        formattedNumber = '(' + phoneNumDigits.substring(0, 3) + ') ' + phoneNumDigits.substring(3, 6) + '-' + phoneNumDigits.substring(6);
      else if (phoneNumDigits.length >= 3)
        formattedNumber = '(' + phoneNumDigits.substring(0, 3) + ') ' + phoneNumDigits.substring(3);
    
      field.value = formattedNumber;
      console.log('validatePhoneNo(): field.value = ', field.value)
  }

  cancel(/*form: NgForm*/) {
    // this.editing.emit(false);
    this.invitationForm.reset();
  }


  
  openAddSomeoneDialog() {
      this.translated = true
  }


  
  /***********
  updateMessage() {
      console.log("updateMessage()")    
      let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+this.invitation.invitationId+"/"+this.invitation.phoneNumber};
      this.themessage = this.getInvitationMessage(this.user.displayName, url);
      this.invitationForm.get("message").setValue(this.themessage);
  }


  getInvitationMessage(displayName: string, parm: {protocol: string, host: string, pathname: string}) {
    let baseMsg = 'name  is inviting you to participate in a video call on HeadsUp.  Click the link below to see this invitation. \n\n url \n\n Do not reply to this text message.  This number is not being monitored.'
    //var res = await this.afs.collection('config').doc('invitation_template').ref.get();
    let msg = baseMsg.replace(/name/, displayName);
    //let host = parm.host.indexOf("localhost") == -1 ? parm.host : this.ngrok
    //let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+this.invitation.invitationId+"/"+this.invitation.phoneNumber};
    
    this.invitation.phoneNumber = this.getPhoneNumber();
    let url = `${parm.protocol}//${parm.host}/video-call/${this.invitation.invitationId}/${this.invitation.phoneNumber}`

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
