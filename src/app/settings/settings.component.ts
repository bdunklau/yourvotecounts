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
    camValue: number
    micValue: number

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



    camSuccess(stream) {
        this.videoStream = stream
    }

    camFail(err) {
        console.log('camFail: err = ', err)
    }

    async turnCameraOn() {
        let camValue = await this.testCamera(this.camSuccess.bind(this), this.camFail.bind(this))
    }

    async turnCameraOff() {
        if(this.videoStream) {
            let tracks = this.videoStream.getTracks();

            tracks.forEach(function (track) {
                track.stop();
            });
            console.log('camera off')

            // this.videoStream.nativeElement.srcObject = null;
            // this.videoStream.nativeElement.stop();
        }
    }

    micSuccess(stream) {
        this.audioStream = stream
    }

    micFail(err) {
        console.log('micFail: err = ', err)
    }

    async turnMicOn() {
        let micValue = await this.testMic(this.micSuccess.bind(this), this.micFail.bind(this))
    }

    async turnMicOff() {
        if(this.audioStream) {
            let tracks = this.audioStream.getTracks();

            tracks.forEach(function (track) {
                track.stop();
            });

            // this.audioStream.nativeElement.srcObject = null;
            // this.audioStream.nativeElement.stop();
        }
    }

    
    async testCamera(successFn, errorFn) {
        let loc = 'testCamera()'
        return await this.testMedia(loc, {video:true}, successFn, errorFn) 
    }

    
    async testMic(successFn, errorFn) {
        let loc = 'testMic()'
        return await this.testMedia(loc, {audio:true}, successFn, errorFn) 
    }


    videoStream: any
    audioStream: any



    async testMedia(loc, mediaType, success, err) {
        if(!navigator) return -1
        if(!navigator.mediaDevices) return -1
        if(!navigator.mediaDevices.getUserMedia) return -1
  
        return navigator.mediaDevices.getUserMedia(mediaType)
        .then(success)
        .catch(err);
    }


    tempLocationHref() {
        window.location.href = 'https://www.google.com'
    }

}
