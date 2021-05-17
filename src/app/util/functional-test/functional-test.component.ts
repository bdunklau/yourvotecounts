import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from '../../user/user.model';
import { SmsService } from '../../sms/sms.service';
import { FunctionalTestService } from './functional-test.service';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.model';

@Component({
  selector: 'app-functional-test',
  templateUrl: './functional-test.component.html',
  styleUrls: ['./functional-test.component.css']
})
export class FunctionalTestComponent implements OnInit {

    settings: Settings

    testingSms = true
    smsTestComplete = false
    testingWebcam = false
    webcamTestComplete = false


    testPhone: string
    camResult = ''
    micResult = ''
    textResult = ''
    smsSent = false
    user?: FirebaseUserModel
    smsOk = ''
    

    testForm = new FormGroup({
        testPhoneControl: new FormControl('', { validators: [this.ValidatePhone.bind(this)] /* DOES work   , updateOn: "blur" */ })
    });


    constructor(private userService: UserService,
                private functionalTestService: FunctionalTestService,
                private settingsService: SettingsService,
                private smsService: SmsService) { }

    async ngOnInit() {
        this.user = await this.userService.getCurrentUser()
        if(!this.user) return
        this.settings = await this.settingsService.getSettingsDoc()
        this.testPhone = this.user.phoneNumber
        this.testForm.setValue({testPhoneControl: this.formatPhone2(this.testPhone)})
    }



    async testWebcam() {
        let testResult = await this.functionalTestService.testWebcam()
        this.camResult = testResult.camResult
        this.micResult = testResult.micResult
        this.webcamTestComplete = true
    }


    checkAgain() {
        window.location.reload()
    }
       


    testSms() {        
        this.testPhone = this.getPhoneForSaving( this.testForm.get('testPhoneControl').value )
        console.log('this.testPhone = ', this.testPhone)
        let url = "https://headsup.video/home"
        let message = `HeadsUp!  This message verifies that you are able to received text messages from us\n\n${url}`
        this.smsService.sendSms({from: this.settings.from_sms, to: this.testPhone, mediaUrl: "", message: message});
        this.smsSent = true
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


    /**
     * duplicated in invitation-form.component.ts
     * 
     * NEEDED ?????
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
    

    /**
     * duplicated in   invitation-form.component.ts
     */
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


    justNumbers(value: string) {
        console.log('justNumbers(): beginning value = ', value)
        let replaced = value.replace(/\D/g,''); //  \D = all non-digits 
        console.log('justNumbers(): ending value = ', replaced)
        return replaced
    }


    private getPhoneForSaving(ph: string) {
        let stripped = this.justNumbers(ph)
        // trying to be little more general - re: country code
        if(stripped.startsWith('+'))
            return stripped
        else if(stripped.length == 11)
            return '+'+stripped // user may have copy-pasted a US phone number that contained the 1 but not the +
        else return '+1'+stripped
    }


    async smsFunctional() {
        await this.smsConfirmed(true)
        // this.testingSms = false
        // this.smsTestComplete = true
        this.smsOk = 'yes'
    }


    async smsNotFunctional() {
        await this.smsConfirmed(false)
        // this.testingSms = false
        // this.smsTestComplete = true
        this.smsOk = 'no'
    }


    private async smsConfirmed(bool: boolean) {
        await this.recordSmsFunctionality(bool)
    }

    

    private async recordSmsFunctionality(bool: boolean) {
        if(!this.user) return
        await this.userService.recordSmsFunctionality(this.user, bool)
    }


}
