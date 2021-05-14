import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoomService } from '../../room/room.service';
import { ErrorPageService } from '../../util/error-page/error-page.service';
import * as _ from 'lodash';
import { InvitationService } from '../../invitation/invitation.service';
import { ValidInvitationGuard } from '../../invitation/valid-invitation.guard';
import { DisabledGuard } from '../../disabled/disabled.guard';
import { InvitationDeletedGuard } from '../../invitation/invitation-deleted/invitation-deleted.guard';
import { isPlatformBrowser } from '@angular/common';
import { FunctionalTestService } from '../../util/functional-test/functional-test.service';
import { UserService } from '../../user/user.service';
import { Invitation } from '../../invitation/invitation.model';


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
        private invitationDeletedGuard: InvitationDeletedGuard,
        private functionalTestService: FunctionalTestService,
        private userService: UserService,
        @Inject(PLATFORM_ID) private platformId
    ) {}


    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

        console.log('canActivate():  begin')
            
        let isBrowser = isPlatformBrowser(this.platformId)
        if(isBrowser) {
            // disabledGuard

            let enabled = await this.disabledGuard.canActivate(next, state)
            if(!enabled)
                return false


            // if(this.wrongBrowser()) {
            //     this.errorPageService.errorMsg = "Switch to Safari.  Your Mac/iOS device will not allow this page to load using Chrome.  Don't blame us - blame Apple."
            //     this.router.navigate(['/error-page'])
            //     return false
            // }



            // validInvitationGuard
                        
            let ok = await this.validInvitationGuard.canActivate(next, state);
            if(!ok) {
                return false
            }

            


            // invitationDeletedGuard
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


            //////////////////////////////////////////////////////////////////////////
            // but IF a room exists - HAS THE COMPOSITION ALREADY BEEN CREATED?  HAS THE CALL ENDED? - if the call has ended, user needs to be sent to /video-call-complete
            if(roomProm && roomProm.length > 0) {
                let roomObj = roomProm[0].payload.doc.data()
                // check latest development first...
                if(roomObj['CompositionSid']) {   // CompositionSid is set in twilio-video.js: uploadToFirebaseStorageComplete()
                    this.router.navigate(['/view-video', roomObj['CompositionSid'] ])
                    return false            
                }
                else if(roomObj['call_ended_ms']) {    
                    let hostOrGuest;
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

            }

            let webcamReady = await this.webcamReady()

            /**
             * good or bad - we're going to write the enablements to the invitation doc
             * That way, the host knows the good or bad
             * Notice monitorInvitation() in video-call.component.ts
             */
            let invitation = this.getThisInvitation(this.invitationService.invitations, next.params.phoneNumber)
            this.invitationService.writeEnablements(invitation, webcamReady)


            // console.log('next.params.invitationId = ', next.params.invitationId)
            // console.log('next.params.phoneNumber = ', next.params.phoneNumber)
            if(!webcamReady) {
                this.router.navigate(['/functional-test'])
                return false
            }

            return true

        }
        else {
            return true
        }


    }


    private getThisInvitation(invitations: Invitation[], phoneNumber: string) {
        let invitation = _.find(invitations, inv => {return inv.phoneNumber === phoneNumber})
        console.log('getThisInvitation: invitations = ', invitations,'  phoneNumber = ', phoneNumber, ' xxx invitation = ', invitation)
        return invitation
    }


    /**
     * need to pass back WHAT isn't ready - don't just pass back a true/false for ready
     * because we will be writing to the invitation record exactly what is not ready
     */
    private async webcamReady(): Promise<{passed: boolean, camera: boolean, camResult: string, mic: boolean, micResult: string, userAgent: string}> {
        let user = await this.userService.getCurrentUser()
        if(!user) {  // not logged in
            let webcamOk = await this.functionalTestService.testWebcam()
            console.log('webcamReady: no user webcamOk.passed = ',webcamOk.passed)
            return webcamOk
        }

        if(this.functionalTestService.needToCheckDevice(user)) {
            // check the cam, mic, sms not necessary
            let webcamOk = await this.functionalTestService.testWebcam()
            console.log('webcamReady: needToCheckDevice webcamOk.passed = ',webcamOk.passed)
            return webcamOk
        }
        
        // db has all the info we need (BUT MAY BE BAD CACHED INFO)
        // return the true/false's from the db -  only care about cam and mic, not sms
        let webcamOk = await this.functionalTestService.allEnabledForUser(user)
        console.log('webcamReady: webcamOk = ', webcamOk)
        return webcamOk
    }

    

    /**
     * duplicated at invitation-form.guard.ts
     * That is upstream from here.  That guard is activated when the user first goes to "Video Call" aka /invitations
     */
    // wrongBrowser() {
    //     let mac = navigator.appVersion.toLowerCase().indexOf('mac os x') != -1
    //     let chrome = navigator.appVersion.toLowerCase().indexOf('chrome') != -1
    //     let wrongBrowser = mac && chrome
    //     return wrongBrowser
    // }


  
}
