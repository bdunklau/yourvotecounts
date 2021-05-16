import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from '../../user/user.model';
import { isPlatformBrowser } from '@angular/common';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.model';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';


/**
 * ng g c sms/sms-opt-in-form --module=app
 */
@Component({
  selector: 'app-sms-opt-in-form',
  templateUrl: './sms-opt-in-form.component.html',
  styleUrls: ['./sms-opt-in-form.component.css']
})
export class SmsOptInFormComponent implements OnInit {

    user?: FirebaseUserModel
    settings?: Settings
    thePhoneNumber: string
    headsUpNumber: string
    smsUrl: string 
    

    smsOptInForm = new FormGroup({
      smsOptInPhoneControl: new FormControl('', { validators: [this.ValidatePhone.bind(this)] /* DOES work   , updateOn: "blur" */ })
    });


    constructor(private userService: UserService, 
      private settingsService: SettingsService,     
      @Inject(PLATFORM_ID) private platformId) { }

    async ngOnInit() {
        let isBrowser = isPlatformBrowser(this.platformId)
        if(!isBrowser) return

        this.user = await this.userService.getCurrentUser()
        this.settings = await this.settingsService.getSettingsDoc()
        this.headsUpNumber = this.settings.from_sms

        this.smsUrl = "sms:"+this.headsUpNumber+"?body=START";

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
        let replaced = value.replace(/\D/g,''); //  \D = all non-digits 
        return replaced
    }


    /**
     * duplicated in invitation-form.component.ts and all over the place
     */
    formatPhone(event) {
        let field = event.target
        var phoneNumDigits = field.value.replace(/\D/g, '');
      
        // this.isValidFlg = (phoneNumDigits.length==0 || phoneNumDigits.length == 10);
      
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
      
        field.value = formattedNumber;

      //  backspacing over a - or ) or space needs special handling...
        let lastChar = field.value.substring(field.value.length-1)
        console.log('formatPhone(): lastChar = ', lastChar)
        if(event.inputType === 'deleteContentBackward') { 
            if(lastChar === ' ') field.value = field.value.substring(0, field.value.length-2)
            else if(lastChar === '-') field.value = field.value.substring(0, field.value.length-1)
            else if(lastChar === ')') field.value = field.value.substring(0, field.value.length-1)
        } 

        console.log('formatPhone(): field.value = ', field.value)
    }


    onKeypressEvent(event: any) {
        this.thePhoneNumber = this.justNumbers(event.target.value)
    }

}
