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
    testingWebcam = true
    webcamTestComplete = false
    camResult = ''
    micResult = ''
    user?: FirebaseUserModel
    

    constructor(private userService: UserService,
                private functionalTestService: FunctionalTestService,
                private settingsService: SettingsService,
                private smsService: SmsService) { }

    async ngOnInit() {
        this.user = await this.userService.getCurrentUser()
        if(!this.user) return
        this.settings = await this.settingsService.getSettingsDoc()
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
       
}
