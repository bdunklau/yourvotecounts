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
        }

    }

    ngOnDestry() {
        if(this.compositionSubscription) this.compositionSubscription.unsubscribe()
    }
    

    // async compose_ORIGINAL() {
    //     this.compositionInProgress = true
    //     this.publishButtonText = "Workin' on it!..."
    //     const httpOptions = {
    //         headers: new HttpHeaders({
    //           'Content-Type':  'application/json',
    //           'Authorization': 'my-auth-token',
    //           'Access-Control-Allow-Origin': '*'
    //         }),
    //         //params: new HttpParams().set('uid', uid)
    //     };

    //     // do a POST here not a GET
    //     // and post the whole room document.  No need to query for it in the firebase function

    //     let participantCount = this.roomObj.guests ? this.roomObj.guests.length + 1 : 1

    //     // NOTE: ${this.settingsDoc.website_domain_name} will be the ngrok host if running locally.  See invitation.service.ts:ngrok field
    //     let composeUrl = `https://${this.settingsDoc.firebase_functions_host}/compose?RoomSid=${this.roomObj.RoomSid}&firebase_functions_host=${this.settingsDoc.firebase_functions_host}&room_name=${this.roomObj.invitationId}&website_domain_name=${this.settingsDoc.website_domain_name}&cloud_host=${this.settingsDoc.cloud_host}&participantCount=${participantCount}`
    //     this.compositionSubscription = this.http.get(composeUrl, httpOptions).subscribe(async (data: any) => {
    //           console.log('data = ', data) 
    //           this.router.navigate(['/video/producing'/*, this.roomObj.RoomSid*/])   
    //     });

    // }

    
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

        // do a POST here not a GET
        // and post the whole room document.  No need to query for it in the firebase function

        let participantCount = this.roomObj.guests ? this.roomObj.guests.length + 1 : 1

        // NOTE: ${this.settingsDoc.website_domain_name} will be the ngrok host if running locally.  See invitation.service.ts:ngrok field
        let composeUrl = `https://${this.settingsDoc.firebase_functions_host}/compose?RoomSid=${this.roomObj.RoomSid}&firebase_functions_host=${this.settingsDoc.firebase_functions_host}&room_name=${this.roomObj.invitationId}&website_domain_name=${this.settingsDoc.website_domain_name}&cloud_host=${this.settingsDoc.cloud_host}&participantCount=${participantCount}`

        /**
         * Not completely finished yet.  Not completely generalized.  We look at the first guest in the array and see if it has
         * a participantSid.  Generally, there could be more than one guest. But for this ticket, we are only concerned with
         * cases where there is only 1 guest
         * 
         * https://headsupvideo.atlassian.net/browse/HEADSUP-105
         */
        if(this.roomObj.guests && this.roomObj.guests.length == 1 && this.roomObj.guests[0].participantSid) {
            participantCount = 1
            let participantSid = this.roomObj.guests[0].participantSid
            composeUrl = `https://${this.settingsDoc.firebase_functions_host}/compose?RoomSid=${this.roomObj.RoomSid}&firebase_functions_host=${this.settingsDoc.firebase_functions_host}&room_name=${this.roomObj.invitationId}&website_domain_name=${this.settingsDoc.website_domain_name}&cloud_host=${this.settingsDoc.cloud_host}&participantCount=${participantCount}&participantSid=${participantSid}`
        }

        this.compositionSubscription = this.http.get(composeUrl, httpOptions).subscribe(async (data: any) => {
              console.log('data = ', data) 
              this.router.navigate(['/video/producing'/*, this.roomObj.RoomSid*/])   
        });

    }

}
