import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { RoomService } from '../../room/room.service';
import { RoomObj } from '../../room/room-obj.model';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';  // ref:   https://angular.io/guide/http
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-video-call-complete',
  templateUrl: './video-call-complete.component.html',
  styleUrls: ['./video-call-complete.component.css']
})
export class VideoCallCompleteComponent implements OnInit {

    roomObj: RoomObj
    isHost = false
    compositionInProgress: boolean = false
    publishButtonText = "Get Recording" // we change this to "Workin' on it" at the beginning of compose()
    settingsDoc: Settings
    private compositionSubscription: Subscription;
    hostCheckboxValue = false
    hostCheckboxIsVisible = false


    constructor(private roomService: RoomService,
                private settingsService: SettingsService,
                @Inject(PLATFORM_ID) private platformId,
                private router: Router,
                private http: HttpClient,) { }

    async ngOnInit() {
        //  http://localhost:4200/video-call-complete/RM1606199766698/guest/+12146325613

        if(isPlatformBrowser(this.platformId)) {
            this.roomObj = this.roomService.roomObj
            this.isHost = this.roomService.isHost
            this.settingsDoc = await this.settingsService.getSettingsDoc()

            /**
             * https://headsupvideo.atlassian.net/browse/HEADSUP-105
             * Determine if we should even show the "include Host in Video" checkbox
             * 
             * - Number of guests has to be 1
             * - the guest has to have a participantSid
             */
            this.hostCheckboxIsVisible = this.doWeShowCheckbox(this.roomObj, this.isHost)

            // if we're not showing the checkbox, then default its value to true - include the host
            if(!this.hostCheckboxIsVisible) this.hostCheckboxValue = true

            console.log('hostCheckboxValue = ', this.hostCheckboxValue)
        }

    }


    private doWeShowCheckbox(roomObj: RoomObj, isHost: boolean) {
        if(!isHost) return false
        if(!roomObj) return false
        if(!roomObj.guests) return false 
        if(roomObj.guests.length != 1) false // one guest only for now   https://headsupvideo.atlassian.net/browse/HEADSUP-105
        if(!roomObj.guests[0].participantSid) return false
        return true
    }


    ngOnDestry() {
        if(this.compositionSubscription) this.compositionSubscription.unsubscribe()
    }

    
    async compose() {
        this.compositionInProgress = true
        this.publishButtonText = "Workin' on it!..."
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
              'Access-Control-Allow-Origin': '*'
            }),
            //params: new HttpParams().set('uid', uid)
        };

        let composeUrl = this.getComposeUrl()

        console.log('check compose url:  ', composeUrl)

        this.compositionSubscription = this.http.get(composeUrl, httpOptions).subscribe(async (data: any) => {
              console.log('data = ', data) 
              this.router.navigate(['/video/producing'/*, this.roomObj.RoomSid*/])   
        });

    }


    private getComposeUrl() {
        if(this.hostCheckboxValue) {
            let participantCount = this.roomObj.guests ? this.roomObj.guests.length + 1 : 1
            return `https://${this.settingsDoc.firebase_functions_host}/compose?RoomSid=${this.roomObj.RoomSid}&firebase_functions_host=${this.settingsDoc.firebase_functions_host}&room_name=${this.roomObj.invitationId}&website_domain_name=${this.settingsDoc.website_domain_name}&cloud_host=${this.settingsDoc.cloud_host}&participantCount=${participantCount}`
        }

        let participantCount = 1
        let participantSid = this.roomObj.guests[0].participantSid
        return `https://${this.settingsDoc.firebase_functions_host}/compose?RoomSid=${this.roomObj.RoomSid}&firebase_functions_host=${this.settingsDoc.firebase_functions_host}&room_name=${this.roomObj.invitationId}&website_domain_name=${this.settingsDoc.website_domain_name}&cloud_host=${this.settingsDoc.cloud_host}&participantCount=${participantCount}&participantSid=${participantSid}`
    }

}
