import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from '../../user/user.model';
import { NgForm, AbstractControl, FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { UserService } from '../../user/user.service';


@Component({
  selector: 'app-friend-form',
  templateUrl: './friend-form.component.html',
  styleUrls: ['./friend-form.component.css']
})
export class FriendFormComponent implements OnInit {

    me: FirebaseUserModel

    friendForm = new FormGroup({
        friendName: new FormControl('', [Validators.required]),
        friendPhone: new FormControl('', { validators: [Validators.required, this.ValidatePhone.bind(this)] /* DOES work   , updateOn: "blur" */ })
    });

    constructor(
      // private fb: FormBuilder
      private userService: UserService
    ) {  }

    async ngOnInit() {
        this.me = await this.userService.getCurrentUser()
    }
    

    async onSubmit(/*form: NgForm*/) {
        let friend = {
            displayName: this.friendForm.get('friendName').value,
            phoneNumber: this.getPhoneForSaving( this.friendForm.get('friendPhone').value )
        }
        await this.userService.addFriend({person1: this.me, person2: friend})
        this.friendForm.reset();
    }
  

    /**
     * duplicated in invitation-form.component.ts
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


    private getPhoneForSaving(ph: string) {
        let stripped = this.justNumbers(ph)
        // trying to be little more general - re: country code
        if(stripped.startsWith('+'))
            return stripped
        else return '+1'+stripped
    }

}
