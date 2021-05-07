import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoomService } from '../../room/room.service';
import { ErrorPageService } from '../../util/error-page/error-page.service';
import * as _ from 'lodash';


/**
 * Makes sure we should proceed to the /video-call-complete route
 * Don't proceed if
 * - the RoomSid path param isn't good
 * - the hostOrGuest and phoneNumber path params don't make sense
 */
@Injectable({
  providedIn: 'root'
})
export class VideoCallCompleteGuard implements CanActivate {

    constructor(
        private roomService: RoomService,
        //private invitationService: InvitationService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId,
        private errorPageService: ErrorPageService,
        //private invitationGuard: ValidInvitationGuard
    ) {}

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

        if(isPlatformBrowser(this.platformId)) {




            // let ok = await this.invitationGuard.canActivate(next, state);
            // if(!ok) {
            //     return false
            // }

            //console.log("check navigator: ", navigator)

            // this should be its own guard
            // if(this.wrongBrowser()) {
            //     this.errorPageService.errorMsg = "Switch to Safari.  Your Mac/iOS device will not allow this page to load using Chrome.  Don't blame us - blame Apple."
            //     this.router.navigate(['/error-page'])
            //     return false
            // }

            let roomSid = next.paramMap.get('RoomSid')
            let hostOrGuest = next.paramMap.get('hostOrGuest')
            let phoneNumber = next.paramMap.get('phoneNumber')

            if(!roomSid || !hostOrGuest || !phoneNumber) {
                this.errorPageService.errorMsg = "That's a weird URL"
                this.router.navigate(['/error-page'])
                return false
            }

            if(hostOrGuest != 'host' && hostOrGuest != 'guest') {
                this.errorPageService.errorMsg = "That's a weird URL"
                this.router.navigate(['/error-page'])
                return false
            }

            // get 'RoomSid' doc from 'room' collection
            let roomObj = await this.roomService.getRoomByRoomSid(roomSid)//.getRoomByRoomSid(roomSid)
            if(!roomObj) {
                this.errorPageService.errorMsg = "Strange stuff in that URL"
                this.router.navigate(['/error-page'])
                return false
            }

            /**
             * https://headsupvideo.atlassian.net/browse/HEADSUP-106
             */
            if(!roomObj.call_ended_ms) {
                await this.roomService.setCallEnded(roomObj)
            }


            ///////////////////////////////////////////////////////////////////////
            // At this point - we have valid RoomSid, 'host' or 'guest' and some kind of phoneNumber path param
            // Let's make sure they all point to a valid record
            if(hostOrGuest === 'host') {
                if(roomObj.hostPhone != phoneNumber) {
                    this.errorPageService.errorMsg = "Yeah... that's not a good URL"
                    this.router.navigate(['/error-page'])
                    return false
                }
            }
            else {
                let guest = _.find(roomObj.guests, guest => {
                    return guest['guestPhone'] === phoneNumber
                })
                if(!guest) {
                    this.errorPageService.errorMsg = "Yeah..... that's not a good URL"
                    this.router.navigate(['/error-page'])
                    return false
                }
            }


            /////////////////////////////////////////////////////////////////////////////
            // ALL GOOD - PROCEED TO /video-call-complete
            // Pass the roomObj along to the component via the service obj
            this.roomService.roomObj = roomObj
            this.roomService.isHost = hostOrGuest === 'host'
            return true;
        } // if(isPlatformBrowser(this.platformId))
        
        return true

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
