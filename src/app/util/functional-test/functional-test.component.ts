import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { UserService } from 'src/app/user/user.service';
import { FirebaseUserModel } from 'src/app/user/user.model';
import { SmsService } from 'src/app/sms/sms.service';

@Component({
  selector: 'app-functional-test',
  templateUrl: './functional-test.component.html',
  styleUrls: ['./functional-test.component.css']
})
export class FunctionalTestComponent implements OnInit {

    testingSms = true
    smsTestComplete = false
    testingWebcam = false
    webcamTestComplete = false


    testPhone: string
    videoStream: any
    audioStream: any
    camResult = ''
    micResult = ''
    textResult = ''
    smsSent = false
    user?: FirebaseUserModel
    deviceIsMobile = ''  // string for tri-state null, true and false
    smsOk = ''
    

    testForm = new FormGroup({
        testPhoneControl: new FormControl('', { validators: [this.ValidatePhone.bind(this)] /* DOES work   , updateOn: "blur" */ })
    });


    constructor(private userService: UserService,
                private smsService: SmsService) { }

    async ngOnInit() {
        this.user = await this.userService.getCurrentUser()
        if(this.user) { 
            this.testPhone = this.user.phoneNumber
            this.testForm.setValue({testPhoneControl: this.formatPhone2(this.testPhone)})
        }
    }



    async testWebcam() {
        await this.turnOnCamera()
        await this.turnOnMic()
        this.webcamTestComplete = true
    }
    

    
    async turnOnCamera() {
        let camValue = await this.testCamera(this.camSuccess.bind(this), this.camFail.bind(this))
    }

    async turnCameraOff() {
        if(!this.videoStream) return
        let tracks = this.videoStream.getTracks();

        tracks.forEach(function (track) {
            track.stop();
        });
        console.log('camera off')
    }

    async camSuccess(stream) {
        this.videoStream = stream
        this.camResult = 'ok'
        await this.recordCameraFunctionality(true)
        await this.turnCameraOff()
    }

    async camFail(err) {
        console.log('camFail: err = ', err)
        this.camResult = 'You webcam is blocked by your device or browser.  Try another browser with this device.  If '+
            'no other browser works, try a different device'
        await this.recordCameraFunctionality(false)
    }
    
    async testCamera(successFn, errorFn) {
        return await this.testMedia({video:true}, successFn, errorFn) 
    }

    private async recordCameraFunctionality(bool: boolean) {
        if(!this.user) return
        await this.userService.recordCameraFunctionality(this.user, bool)
    }


    


    
    async turnOnMic() {
        let micValue = await this.testMic(this.micSuccess.bind(this), this.micFail.bind(this))
    }

    async turnMicOff() {
        if(!this.audioStream) return
        let tracks = this.audioStream.getTracks();

        tracks.forEach(function (track) {
            track.stop();
        });
    }

    async micSuccess(stream) {
        this.audioStream = stream
        this.micResult = 'ok'
        await this.recordMicFunctionality(true)
        await this.turnMicOff()
    }

    async micFail(err) {
        console.log('micFail: err = ', err)
        this.micResult = 'Your microphone is blocked by your device or browser.  Try another browser with this device.  If '+
            'no other browser works, try a different device'
        await this.recordMicFunctionality(false)
    }
    
    async testMic(successFn, errorFn) {
        return await this.testMedia({audio:true}, successFn, errorFn) 
    }

    private async recordMicFunctionality(bool: boolean) {
        if(!this.user) return
        await this.userService.recordMicFunctionality(this.user, bool)
    }





    
    async testMedia(mediaType, success, err) {
        if(!navigator) return -1
        if(!navigator.mediaDevices) return -1
        if(!navigator.mediaDevices.getUserMedia) return -1
  
        return navigator.mediaDevices.getUserMedia(mediaType)
        .then(success)
        .catch(err);

    }


    testSms() {        
        this.testPhone = this.getPhoneForSaving( this.testForm.get('testPhoneControl').value )
        console.log('this.testPhone = ', this.testPhone)
        let url = "https://headsup.video/home"
        let message = `HeadsUp!  This message verifies that you are able to received text messages from us\n\n${url}`
        this.smsService.sendSms({from: "+12673314843", to: this.testPhone, mediaUrl: "", message: message});
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


    currentDeviceIsMobilePhone(yesno: string) {
        this.deviceIsMobile = yesno
    }


}
