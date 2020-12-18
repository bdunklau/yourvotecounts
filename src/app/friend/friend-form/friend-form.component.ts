import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from 'src/app/user/user.model';
import { NgForm, AbstractControl, FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { UserService } from 'src/app/user/user.service';


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
    
  
    validatePhoneNo(field) {
        var phoneNumDigits = field.value.replace(/\D/g, '');
      
        var formattedNumber = phoneNumDigits;
        if (phoneNumDigits.length >= 6)
          formattedNumber = '(' + phoneNumDigits.substring(0, 3) + ') ' + phoneNumDigits.substring(3, 6) + '-' + phoneNumDigits.substring(6);
        else if (phoneNumDigits.length >= 3)
          formattedNumber = '(' + phoneNumDigits.substring(0, 3) + ') ' + phoneNumDigits.substring(3);
      
        field.value = formattedNumber;
        console.log('validatePhoneNo(): field.value = ', field.value)
    }

    
  
    ValidatePhone(control: AbstractControl): {[key: string]: any} | null  {
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


    private getPhoneForSaving(ph: string) {
        let stripped = this.justNumbers(ph)
        // trying to be little more general - re: country code
        if(stripped.startsWith('+'))
            return stripped
        else return '+1'+stripped
    }

}
