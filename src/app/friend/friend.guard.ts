import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { DisabledGuard } from '../disabled/disabled.guard';
import { MinimalAccountInfoGuard } from '../my-account/minimal-account-info/minimal-account-info.guard';
import { AuthGuard } from '../core/auth.guard';


@Injectable({
  providedIn: 'root'
})
export class FriendGuard implements CanActivate {

    constructor(
        // private roomService: RoomService,
        // private invitationService: InvitationService,
        // private router: Router,
        // private errorPageService: ErrorPageService,
        // private validInvitationGuard: ValidInvitationGuard,
        private authGuard: AuthGuard,
        private minimalAccountInfoGuard: MinimalAccountInfoGuard,
        private disabledGuard: DisabledGuard,
        // private invitationDeletedGuard: InvitationDeletedGuard,
        @Inject(PLATFORM_ID) private platformId
    ) {}


    // ex:  VideoCallGuard
    async canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Promise<boolean> {

          
        let isBrowser = isPlatformBrowser(this.platformId)
        if(isBrowser) { 
            let authed = await this.authGuard.canActivate()
            console.log('FriendGuard: authed = ', authed)
            if(!authed) 
                return false
            
            let enabled = await this.disabledGuard.canActivate(next, state)
            console.log('FriendGuard: enabled = ', enabled)
            if(!enabled)
                return false

            let hasMinimalAccountInfo = await this.minimalAccountInfoGuard.canActivate(next, state)
            console.log('FriendGuard: hasMinimalAccountInfo = ', hasMinimalAccountInfo)
            if(!hasMinimalAccountInfo)
                return false

            return true
            
        }
        else return true
    }
  
}
