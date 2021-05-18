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
import { FunctionalTestService } from 'src/app/util/functional-test/functional-test.service';
import { InvitationService } from '../invitation.service';


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
        private functionalTestService: FunctionalTestService,
        private invitationService: InvitationService,
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


            // if(this.wrongBrowser()) {
            //     this.errorPageService.errorMsg = "Switch to Safari.  Your Mac/iOS device will not allow this page to load using Chrome.  Don't blame us - blame Apple."
            //     this.router.navigate(['/error-page'])
            //     return false
            // }
    

            let authed = await this.authGuard.canActivate()
            if(!authed) 
                return false

            
            let minimalInfo = await this.minimalAccountInfoGuard.canActivate(next, state)
            if(!minimalInfo) 
                return false


            // TODO need SmsOptInGuard here - or just the code equivalent - may not need a full blown guard class
            let user = await this.userService.getCurrentUser() // guaranteed by authGuard above
            let optIn = await this.invitationService.queryOptIn(user.phoneNumber)
            if(!optIn) {
                this.router.navigate(['/optin'])
                return false
            }


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
            if(!responseFromMediaCheck) {
                this.router.navigate(['/functional-test'])
                return false
            }
        }

        return true
    }


    async checkCameraAndMicEnablement(): Promise<{ok: boolean, msg?: string, title?: string}> {
        let user = await this.userService.getCurrentUser()
        let cameraEnabled = await this.functionalTestService.isCameraEnabledForUser(user)
        let micEnabled = await this.functionalTestService.isMicEnabledForUser(user)
        console.log('cameraEnabled = ', cameraEnabled)
        console.log('micEnabled = ', micEnabled)
        return cameraEnabled && micEnabled
    }

  
}
