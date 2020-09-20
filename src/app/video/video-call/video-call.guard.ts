import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoomService } from '../../room/room.service';
import { ErrorPageService } from '../../util/error-page/error-page.service';
import * as _ from 'lodash';
import { InvitationService } from '../../invitation/invitation.service';
import { ValidInvitationGuard } from '../../invitation/valid-invitation.guard';
import { DisabledGuard } from '../../disabled/disabled.guard';
import { InvitationDeletedGuard } from '../../invitation/invitation-deleted/invitation-deleted.guard';


/**
 * UPDATE 9/3/20 - this is now a general purpose guard for the /video-call screen.  We check everything here that could
 * be wrong with this page, notably, we now check
 *  - browser+OS :  iOS + Chrome -> bad
 * 
 * We call this guard to see if the video has already been created/produced.  If it has, then we redirect the users
 * to a screen where they can watch the video
 * 
 * How do we know if the video has already been created?  
 * Ans:  Look for CompositionSid in the room doc.  If CompositionSid exists, then that room and invitation can't be used anymore
 * 
 * How:  Query the room collection by invitationId.  That will return a room doc.  The room doc MAY have a CompositionSid field.
 * 
 * See the /video-call routes
 */
@Injectable({
  providedIn: 'root'
})
export class VideoCallGuard implements CanActivate {

    constructor(
        private roomService: RoomService,
        private invitationService: InvitationService,
        private router: Router,
        private errorPageService: ErrorPageService,
        private validInvitationGuard: ValidInvitationGuard,
        private disabledGuard: DisabledGuard,
        private invitationDeletedGuard: InvitationDeletedGuard
    ) {}

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

        let enabled = await this.disabledGuard.canActivate(next, state)
        if(!enabled)
            return false
    

        if(this.wrongBrowser()) {
            this.errorPageService.errorMsg = "Switch to Safari.  Your Mac/iOS device will not allow this page to load using Chrome.  Don't blame us - blame Apple."
            this.router.navigate(['/error-page'])
            return false
        }


        let ok = await this.validInvitationGuard.canActivate(next, state);
        if(!ok) {
            return false
        }

        let stillGood = this.invitationDeletedGuard.canActivate(next, state)
        if(!stillGood) {
            return false
        }

        console.log("this.invitationService.invitations: ", this.invitationService.invitations)


        let phoneNumber = next.paramMap.get('phoneNumber')
        if(!phoneNumber) {
            this.errorPageService.errorMsg = "I don't know what to do with that URL.  Here's an error code that means nothing to you:  1001"
            this.router.navigate(['/error-page'])
            return false
        }

  
        // Now make sure the url is legit - make sure the invitationId is good - make sure the phone number matches the invitationId
        ////////////////////////////////////////////////////////////////////////////
        //  VALIDATE INVITATION ID
        let roomRef = this.roomService.getRoom(next.paramMap.get('invitationId'))
        let roomProm = await roomRef.toPromise()
        // room does not have to exist yet - it is created when one person "joins"


        ////////////////////////////////////////////////////////////////////////////
        // but IF a room exists - HAS THE COMPOSITION ALREADY BEEN CREATED?  HAS THE CALL ENDED? - if the call has ended, user needs to be sent to /video-call-complete
        if(roomProm && roomProm.length > 0) {
            let roomObj = roomProm[0].payload.doc.data()
            // check latest development first...
            if(roomObj['CompositionSid']) {   // CompositionSid is set in twilio-video.js: uploadToFirebaseStorageComplete()
                this.router.navigate(['/view-video', roomObj['CompositionSid'] ])
                return false            
            }
            else if(roomObj['call_ended_ms']) {    let hostOrGuest;
                if(roomObj['hostPhone'] === phoneNumber) 
                    hostOrGuest = 'host'
                if(!hostOrGuest) {
                    let found = _.find(roomObj['guests'], guest => {
                        return guest['guestPhone'] === phoneNumber
                    })
                    if(found) hostOrGuest = 'guest'
                }
                this.router.navigate(['/video-call-complete', roomObj['RoomSid'], hostOrGuest, phoneNumber ]);
                return false            
            }


            /////////////////////////////////////////////////////////////////////////////
            // IS THE VIDEO IS READY ?  move this over to video-call-complete.guard.ts
            //
            // if(roomObj['CompositionSid']) {  // CompositionSid is set in twilio-video.js: uploadToFirebaseStorageComplete()
            //     this.router.navigate(['/view-video', roomObj['CompositionSid'] ]);
            //     return false            
            // }
        }


        /////////////////////////////////////////////////////////////////////////////
        // ALL GOOD - the call has not ended - PROCEED TO /video-call
        return true;

    }


    getPhones(roomObj) {
        let phones = []
        if(roomObj['guests']) {
            _.each(roomObj['guests'], guest => {
                phones.push(guest['guestPhone'])
            })
        }
        if(roomObj['hostPhone']) phones.push(roomObj['hostPhone'])
        return phones
    }
    

    wrongBrowser() {
        let mac = navigator.appVersion.toLowerCase().indexOf('mac os x') != -1
        let chrome = navigator.appVersion.toLowerCase().indexOf('chrome') != -1
        let wrongBrowser = mac && chrome
        return wrongBrowser
    }
  
}
