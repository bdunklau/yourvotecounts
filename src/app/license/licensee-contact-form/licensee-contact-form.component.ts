import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { Licensee } from '../licensee/licensee.model';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { LicenseService } from '../license.service';
import { isPlatformBrowser } from '@angular/common';
import { MessageService } from 'src/app/core/message.service';
import { Subscription } from 'rxjs';
import { LicenseeContact } from '../licensee-contact/licensee-contact.model';

@Component({
  selector: 'app-licensee-contact-form',
  templateUrl: './licensee-contact-form.component.html',
  styleUrls: ['./licensee-contact-form.component.css']
})
export class LicenseeContactFormComponent implements OnInit {

    @Input() inputLicensee: Licensee
    licenseeContactListener: Subscription
    licenseeContact: LicenseeContact
    confirmDelete = false
    

    licenseeContactForm = new FormGroup({
        licenseeContactName: new FormControl('', [Validators.required]),
        licenseeContactPhone: new FormControl('', { validators: [Validators.required, this.ValidatePhone.bind(this)] /* DOES work   , updateOn: "blur" */ })
    });

    
    constructor(private licenseService: LicenseService, 
            private messageService: MessageService,
            @Inject(PLATFORM_ID) private platformId) { }

    ngOnInit(): void {
        if(isPlatformBrowser(this.platformId)) {

            let yyyy = function(licenseeContact: LicenseeContact) { 
                if(this.licenseeContactSubscription) this.licenseeContactSubscription.unsubscribe()
                console.log('LicenseeContactFormComponent: ', licenseeContact)
                this.licenseeContact = licenseeContact
                this.licenseeContactForm.setValue({licenseeContactName: licenseeContact.displayName, licenseeContactPhone: this.formatPhone2(licenseeContact.phoneNumber)})
            }.bind(this)

            this.licenseeContactListener = this.messageService.listenForLicenseeContact().subscribe({
                next: yyyy,
                error: () => {}, 
                complete: () => {}
            })

        }
    }

    

    async onSubmit(/*form: NgForm*/) {
        let licenseeContact:LicenseeContact = new LicenseeContact()
        if(this.licenseeContact && this.licenseeContact.id) licenseeContact.id = this.licenseeContact.id
        licenseeContact.displayName = this.licenseeContactForm.get('licenseeContactName').value
        licenseeContact.phoneNumber = this.getPhoneForSaving( this.licenseeContactForm.get('licenseeContactPhone').value )
        licenseeContact.created_ms = new Date().getTime()
        licenseeContact.licenseeId = this.inputLicensee.id

        await this.licenseService.addLicenseeContact(licenseeContact)
        this.licenseeContactForm.reset();
        this.licenseeContact = new LicenseeContact()
    }


    async deleteLicenseeContact(licenseeContact: LicenseeContact) {
        if(!this.confirmDelete) {
            this.confirmDelete = true
            return
        }
        else {
            await this.licenseService.deleteLicenseeContact(licenseeContact)
            this.confirmDelete = false
            this.licenseeContactForm.reset();
            this.licenseeContact = new LicenseeContact()
        }
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
}
