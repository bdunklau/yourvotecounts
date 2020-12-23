import { Component, OnInit, OnDestroy, OnChanges, Inject, PLATFORM_ID, Input, Output, EventEmitter, ViewChild } from '@angular/core';
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
import { FirebaseUserModel } from '../../user/user.model';
import * as _ from 'lodash'
import { SettingsService } from '../../settings/settings.service';
import { MessageService } from '../../core/message.service';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { Friend } from '../../friend/friend.model';



@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.css']
})
export class InvitationFormComponent implements OnInit {

  // see  video-call.component.html
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
  friend?: Friend

  constructor(
    private smsService: SmsService,
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private invitationService: InvitationService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId,
    private messageService: MessageService,
    private userService: UserService) { 

      // this class can also be called from video-call.component.ts
      
      this.names = []

      this.createForm();

      // friend-list.component.html
      if(this.router.getCurrentNavigation().extras.state) {
          this.friend = this.router.getCurrentNavigation().extras.state.friend as Friend
          console.log('this.friend.displayName2 = ', this.friend.displayName2)
          console.log('this.friend.phoneNumber2 = ', this.friend.phoneNumber2)
          this.addSomeone3(this.friend.displayName2, this.friend.phoneNumber2)
      } 

      // console.log('this.invitationForm = ', this.invitationForm)
  }

  async ngOnInit(): Promise<void> {

    // we don't want this - we want config/settings/website_domain_name
    if (isPlatformBrowser(this.platformId)) {
        // console.log(this.router.getCurrentNavigation().state.friend.phoneNumber);

        this.maxGuests = this.settingsService.maxGuests
        this.currentInviteCount = this.currentInvitations ? this.currentInvitations.length : 0
        this.numberOfInvitationsRemaining = this.maxGuests - this.currentInviteCount
        this.host = window.location.host //this.settingsService.settings.website_domain_name
        // console.log('InvitationFormComponent: isPlatformBrowser: true: window.location.host = ', window.location.host)

        this.canInvite = this.canInviteMore()      

        /**
         * if friend passed in from friend-list.component.html, then we already added that person in the constructor
         * In that case, make the user press "Add Guest" before someone else can be added
         */
        if(!this.friend)
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
      // this.names.push({displayName: '', phoneNumber: ''});
      // let group = this.fb.group({
      //       displayName: new FormControl('', [Validators.required]),
      //       phoneNumber: new FormControl('', { validators: [Validators.required, this.ValidatePhone.bind(this)] /* DOES work   , updateOn: "blur" */ })
      //     } 
      //     //, { updateOn: 'blur' }  // another option
      // )
      // this.nameArray.push(group);
      // // console.log('this.nameArray: ', this.nameArray)
      // this.canInvite = this.canInviteMore()      
      this.addSomeone3('', '')
  }


  addSomeone2() {
      let displayName = ''
      let phoneNumber = ''
      if(this.friend) {
          displayName = this.friend.displayName2
          phoneNumber = this.friend.phoneNumber2
      }
      this.addSomeone3(displayName, phoneNumber)
  }


  addSomeone3(displayName: string, phoneNumber: string) {
      this.names.push({displayName: displayName, phoneNumber: phoneNumber});
      let group = this.fb.group({
            displayName: new FormControl(displayName, [Validators.required]),
            phoneNumber: new FormControl(this.formatPhone2(phoneNumber), { validators: [Validators.required, this.ValidatePhone.bind(this)] /* DOES work   , updateOn: "blur" */ })
          } 
          //, { updateOn: 'blur' }  // another option
      )
      this.nameArray.push(group);
      // console.log('this.nameArray: ', this.nameArray)
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


  /**
   * happens before onSubmit()
   */
  doit() {


      for(var i=0; i < this.nameArray.length; i++) {
          console.log('doit(): this.nameArray.at('+i+').value: ', this.nameArray.at(i).value)
          this.names[i] = this.nameArray.at(i).value
      }
        
      // console.log('this.nameArray: ', this.nameArray)
      // console.log('this.names: ', this.names)
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
      if(!control || !control.value) return null
      let myString = this.justNumbers(control.value)  
      if(!myString)  return { 'phoneNumberInvalid': true };
      if(myString.length < 10) { // 10 or higher to allow all country codes
          return { 'phoneNumberInvalid': true };
      }
      return null;
  }

  justNumbers(value: string) {
      console.log('justNumbers(): value = ', value)
      let replaced = value.replace(/\D/g,''); //  \D = all non-digits 
      return replaced
  }
  

  async onSubmit(/*form: NgForm*/) {      

      // multiple invitation documents will all have this invitationId field
      let commonInvitationId = this.currentInvitations && this.currentInvitations.length > 0 ? this.currentInvitations[0].invitationId : this.invitationService.createId();

      for(var i=0; i < this.nameArray.length; i++) {
          //console.log('this.nameArray.at(i).value: ', this.nameArray.at(i).value)
          this.names[i] = this.nameArray.at(i).value

          /**
           * search-user-by-name.component.ts and  .html
           * User picks a value from this dropdown control.  Value is the entire friend object, not just the displayName2
           * So we extract just the displayName2 value
           * 
           * But if the user types a name that isn't a known friend, then the value stored in the 'displayName' control is just the
           * string in the <input>.  So the 'if' block below won't get executed.  We can just take the value entered by the user
           */
          if(this.nameArray.at(i).value.displayName.displayName2) {
              this.names[i] = {displayName: this.nameArray.at(i).value.displayName.displayName2, phoneNumber: this.nameArray.at(i).value.phoneNumber}
          } 

          // create the invitation
          let invitation = new Invitation();
          invitation.invitationId = commonInvitationId;
          invitation.setCreator(this.user);
          invitation.displayName = this.names[i].displayName
          // console.log('onSubmit(): this.names['+i+'] = ', this.names[i])
          // console.log('onSubmit(): this.names['+i+'].displayName = ', this.names[i].displayName)
         
          //let url = {protocol: "https:", host: window.location.host, pathname: "/video-call/"+invitation.invitationId+"/"+this.names[i].phoneNumber};
          //this.themessage = this.getInvitationMessage(this.user.displayName, url);

          console.log('onSubmit(): this.names['+i+'].phoneNumber = ', this.names[i].phoneNumber)
          let tempPh = this.justNumbers(this.names[i].phoneNumber)
          let noCountryCode = tempPh.length < 11
          console.log('onSubmit(): tempPh = ', tempPh)
          let US_COUNTRY_CODE = '1'
          if(noCountryCode) tempPh = US_COUNTRY_CODE + tempPh
          console.log('onSubmit(): tempPh = ', tempPh)
          invitation.phoneNumber = '+'+tempPh
          console.log('onSubmit(): tempPh = ', tempPh)

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



      /***** don't update invitations - just cancel and reissue  *****/
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
  

  /**
   * duplicated in friend-form.component.ts
   */
  formatPhone(event) {
      let field = event.target
      field.value = this.formatPhone2(field.value)

      /**
       * backspacing over a - or ) or space needs special handling...
       */
      let lastChar = field.value.substring(field.value.length-1)
      console.log('validatePhoneNo(): lastChar = ', lastChar)
      if(event.inputType === 'deleteContentBackward') { 
          if(lastChar === ' ') field.value = field.value.substring(0, field.value.length-2)
          else if(lastChar === '-') field.value = field.value.substring(0, field.value.length-1)
          else if(lastChar === ')') field.value = field.value.substring(0, field.value.length-1)
      } 

      console.log('validatePhoneNo(): field.value = ', field.value)
  }

  private formatPhone2(value) {    
      var phoneNumDigits = value.replace(/\D/g, '');
    
      var formattedNumber = phoneNumDigits;
      if(phoneNumDigits.length > 12) {
        formattedNumber = '+'+phoneNumDigits.substring(0, 3)+' (' + phoneNumDigits.substring(3, 6) + ') ' + phoneNumDigits.substring(6, 9) + '-' + phoneNumDigits.substring(9);
      }
      else if(phoneNumDigits.length > 11) {
        formattedNumber = '+'+phoneNumDigits.substring(0, 2)+' (' + phoneNumDigits.substring(2, 5) + ') ' + phoneNumDigits.substring(5, 8) + '-' + phoneNumDigits.substring(8);
      }
      else if(phoneNumDigits.length > 10/*US*/) {
        formattedNumber = '+'+phoneNumDigits.substring(0, 1)+' (' + phoneNumDigits.substring(1, 4) + ') ' + phoneNumDigits.substring(4, 7) + '-' + phoneNumDigits.substring(7);
      }
      else if (phoneNumDigits.length >= 6)
        formattedNumber = '(' + phoneNumDigits.substring(0, 3) + ') ' + phoneNumDigits.substring(3, 6) + '-' + phoneNumDigits.substring(6);
      else if (phoneNumDigits.length >= 3)
        formattedNumber = '(' + phoneNumDigits.substring(0, 3) + ') ' + phoneNumDigits.substring(3);
    
      return formattedNumber;
  }

  cancel(/*form: NgForm*/) {
    // this.editing.emit(false);
    this.invitationForm.reset();
  }


  
  openAddSomeoneDialog() {
      this.translated = true
  }
  

  onFriendSelected(friend: Friend, loopIdx: number) {
      this.nameArray.controls[loopIdx].setValue({displayName: friend.displayName2, phoneNumber: this.formatPhone2(friend.phoneNumber2) })
      console.log('onFriendSelected(): this.nameArray.at('+loopIdx+').value: ', this.nameArray.at(loopIdx).value)
      // console.log('onFriendSelected() loopIdx = ', loopIdx)
      // console.log('onFriendSelected() this.nameArray.at('+loopIdx+') = ', this.nameArray.at(loopIdx))
      // console.log('onFriendSelected() this.nameArray.at('+loopIdx+') = ',  )
      // this.nameArray.at(loopIdx).setValue({displayName: friend.displayName2, phoneNumber: this.formatPhone2(friend.phoneNumber2) })
  }

}
