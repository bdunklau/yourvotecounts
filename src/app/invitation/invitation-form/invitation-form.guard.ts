import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DisabledGuard } from '../../disabled/disabled.guard';
import { AuthGuard } from '../../core/auth.guard';
import { MinimalAccountInfoGuard } from '../../my-account/minimal-account-info/minimal-account-info.guard';
import { PromoCodeGuard } from '../../promo-code/promo-code.guard';
import { SettingsService } from '../../settings/settings.service';
import { ErrorPageService } from '../../util/error-page/error-page.service';
import * as _ from 'lodash'
import { UserService } from 'src/app/user/user.service';
import { TeamService } from 'src/app/team/team.service';
import { take } from 'rxjs/operators';
import { TeamMember } from 'src/app/team/team-member.model';


@Injectable({
  providedIn: 'root'
})
export class InvitationFormGuard implements CanActivate {

    constructor(
        private settingsService: SettingsService,
        private router: Router,
        private disabledGuard: DisabledGuard,
        private authGuard: AuthGuard,
        private minimalAccountInfoGuard: MinimalAccountInfoGuard,
        private errorPageService: ErrorPageService,
        private userService: UserService,
        private teamService: TeamService,
        private promoCodeGuard: PromoCodeGuard,
        @Inject(PLATFORM_ID) private platformId
    ) {}


    async canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Promise<boolean> {


        // chain these:  AuthGuard, DisabledGuard, MinimalAccountInfoGuard   PromoCodeGuard         
        
        let isBrowser = isPlatformBrowser(this.platformId)
        if(isBrowser) { 
            let enabled = await this.disabledGuard.canActivate(next, state)
            if(!enabled)
                return false

            let authed = await this.authGuard.canActivate()
            if(!authed) 
                return false

            
            let minimalInfo = await this.minimalAccountInfoGuard.canActivate(next, state)
            if(!minimalInfo) 
                return false

            /**
             * https://headsupvideo.atlassian.net/browse/HEADSUP-51
             * Don't check promo codes anymore; check access_expiration_ms
             * Rule: if user.access_expiration_ms > current time => user is allowed to initiate a video
             * Rule: if user.access_expiration_ms == null or < current time => have to check the user's teams
             *          Maybe user belongs to a team that has an active access_expiration_ms value - query to find out
             */
            // let hasPromoCode = await this.promoCodeGuard.canActivate(next, state)
            // if(!hasPromoCode) {
            //     return false
            // }    
            let user = await this.userService.getCurrentUser() // guaranteed by authGuard above
            if(!!user.access_expiration_ms && user.access_expiration_ms > new Date().getTime()) {
                // great - move on
            }
            else {
                // no access for you
                // see if someone else has shared their access with you
                let observable = this.teamService.getTeamsForUser(user.uid).pipe(take(1));
                let docChangeActions = await observable.toPromise()
                let teamMembershipsFound = []
                if(docChangeActions && docChangeActions.length > 0) {
                    _.each(docChangeActions, obj => {
                        let teamMember = obj.payload.doc.data() as TeamMember
                        teamMembershipsFound.push(teamMember)
                        // let docId = obj.payload.doc['id']
                        // let ref = this.afs.collection('invitation').doc(docId).ref
                        // batch.update(ref, {deleted_ms: new Date().getTime()})
                    })
                }
                let alrightFoundSomething = _.find(teamMembershipsFound, (teamMembership) => {
                    return teamMembership.access_expiration_ms > new Date().getTime()
                })
                console.log('InvitationFormGuard: alrightFoundSomething = ', alrightFoundSomething, '  new Date().getTime() = ', (new Date().getTime()))
                if(!alrightFoundSomething) {
                    this.router.navigate(['/video-call-not-allowed'])
                    return false
                }
            }
            
 
            let responseFromMediaCheck = await this.checkCameraAndMicEnablement()
            if(!responseFromMediaCheck.ok) {
                this.errorPageService.errorMsg = responseFromMediaCheck.msg
                this.errorPageService.errorTitle = responseFromMediaCheck.title
                this.router.navigate(['/error-page'])
                return false
            }
            else {
                // now deactivate the camera and mic.  We only activated to make sure we could.
                this.turnCameraOff()
                this.turnMicOff()
            }
        }

        return true
    }


    turnCameraOff() {
        if(!this.videoStream) return
        let tracks = this.videoStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        console.log('camera off')
    }


    turnMicOff() {
        if(!this.audioStream) return
        let tracks = this.audioStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
    }


    
    videoStream: any
    audioStream: any


    async checkCameraAndMicEnablement(): Promise<{ok: boolean, msg?: string, title?: string}> {
        
        let cam = await this.testCamera(this.camSuccess.bind(this), this.camFail.bind(this))
        let mic = await this.testMic(this.micSuccess.bind(this), this.micFail.bind(this))
        console.log(`ngOnInit():  camera = ${cam}`)
        console.log(`ngOnInit():  mic = ${mic}`)
        let regardless = false // set to true to test the redirection to error page
        if((cam == -1) || (mic == -1) || regardless) {
 
            let camEnabled = cam == 1 ? 'enabled' : 'not allowed'
            let micEnabled = mic == 1 ? 'enabled' : 'not allowed'
            let blocked = []
            let titleParts = []
            if(cam != 1) {blocked.push('camera'); titleParts.push('Camera'); }
            if(mic != 1) {blocked.push('microphone'); titleParts.push('Mic'); }
            let blockedMedia = _.join(blocked, ' and ')
            let blockedTitle = _.join(titleParts, '/') + ' Problem'
            let msg = "Your device is preventing this browser from using your "+blockedMedia+". If you are not using the standard browser for your device (i.e. Safari on iPhones), we suggest using HeadsUp on your device's standard browser.  We apologize for the inconvenience."
            console.log('checkCameraAndMicEnablement():  return ', {ok: false, msg: msg})
            return {ok: false, msg: msg, title: blockedTitle}
        }
        else {
            console.log('checkCameraAndMicEnablement():  return ', {ok: true})
            
            return {ok: true}
        }
    }


    camSuccess(stream) {
        this.videoStream = stream
        return 1
    }

    camFail(err) {
        console.log('camFail: err = ', err)
        return -1
    }
    
    async testCamera(successFn, errorFn) {
        let loc = 'testCamera()'
        return await this.testMedia(loc, {video:true}, successFn, errorFn) 
    }


    micSuccess(stream) {
        this.audioStream = stream
        return 1
    }

    micFail(err) {
        console.log('micFail: err = ', err)
        return -1
    }
    
    async testMic(successFn, errorFn) {
        let loc = 'testMic()'
        return await this.testMedia(loc, {audio:true}, successFn, errorFn) 
    }


    async testMedia(loc, mediaType, success, err) {
        // let allow = function(allowed) {
        //     this.cameraAllowed = allowed
        //     let p = new Promise((resolve, reject) => {resolve(allowed)})
        //     return p
        // }.bind(this)

        // let success = async function(stream) {
        //     // this.stuff.push(`${loc}: allowed`)
        //     return await allow(1)
        // }.bind(this)

        // let err = async function(err) {
        //     // this.stuff.push(`${loc}: err`)
        //     return await allow(-1)
        // }.bind(this)

        if(navigator) {
            if(navigator.mediaDevices) {
                if(navigator.mediaDevices.getUserMedia) {
                    return navigator.mediaDevices.getUserMedia(mediaType)
                    .then(success)
                    .catch(err);
                    // this.stuff.push(`${loc}: end`)
                }
                else {
                    // this.stuff.push(`${loc}: no getUserMedia`)
                    return -1
                }
            }
            else {
                // this.stuff.push(`${loc}: no mediaDevices`) // FALLING TO HERE
                return -1
            }
        }
        else {
            // this.stuff.push(`${loc}: no navigator`)
            return -1
        }
    }
  
}
