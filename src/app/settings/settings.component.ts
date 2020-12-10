import { Component, OnInit } from '@angular/core';
import { SettingsService } from './settings.service'
import { Settings } from './settings.model'
import {
  FormGroup,
} from "@angular/forms";


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    settingsForm: FormGroup;
    settings: Settings

    constructor(private settingsService: SettingsService) { }

    async ngOnInit() {
        this.settings = await this.settingsService.getSettingsDoc()

    }
    

    async onSubmit(/*form: NgForm*/) { 
        console.log('onSubmit()')
        this.settingsService.updateSettings(this.settings)
    }


    doit() {
        console.log('doit()')
    }


    disabledChecked($event) {
        this.settings.disabled = $event.srcElement.checked;


    }


    consoleLoggingChecked($event) {
        this.settings.console_logging = $event.srcElement.checked;


    }

}
