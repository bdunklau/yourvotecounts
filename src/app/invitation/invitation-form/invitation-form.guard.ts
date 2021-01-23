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

            let hasPromoCode = await this.promoCodeGuard.canActivate(next, state)
            if(!hasPromoCode) {
                return false
            }            

            let responseFromMediaCheck = await this.checkCameraAndMicEnablement()
            if(!responseFromMediaCheck.ok) {
                this.errorPageService.errorMsg = responseFromMediaCheck.msg
                this.errorPageService.errorTitle = responseFromMediaCheck.title
                this.router.navigate(['/error-page'])
                return false
            }
        }

        return true
    }
    async checkCameraAndMicEnablement(): Promise<{ok: boolean, msg?: string, title?: string}> {
        
        let cam = await this.testCamera()
        let mic = await this.testMic()
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

    
    async testCamera() {
        let loc = 'testCamera()'
        return await this.testMedia(loc, {video:true}) 
    }

    
    async testMic() {
        let loc = 'testMic()'
        return await this.testMedia(loc, {audio:true}) 
    }


    async testMedia(loc, mediaType) {
        // this.stuff.push(`${loc}: begin`)
        let allow = function(allowed) {
            this.cameraAllowed = allowed
            let p = new Promise((resolve, reject) => {resolve(allowed)})
            return p
        }.bind(this)

        let success = async function(stream) {
            // this.stuff.push(`${loc}: allowed`)
            return await allow(1)
        }.bind(this)

        let err = async function(err) {
            // this.stuff.push(`${loc}: err`)
            return await allow(-1)
        }.bind(this)

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
