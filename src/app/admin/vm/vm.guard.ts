import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DisabledGuard } from 'src/app/disabled/disabled.guard';
import { SettingsService } from 'src/app/settings/settings.service';
import { AuthGuard } from '../../core/auth.guard';
import { RoleGuard } from 'src/app/core/role.guard';



/**
 * ng g g admin/vm/vm
 */
@Injectable({
  providedIn: 'root'
})
export class VmGuard implements CanActivate {


    constructor(
        // private roomService: RoomService,
        // private invitationService: InvitationService,
        // private router: Router,
        // private errorPageService: ErrorPageService,
        // private validInvitationGuard: ValidInvitationGuard,
        private settingsService: SettingsService,
        private disabledGuard: DisabledGuard,
        private authGuard: AuthGuard,
        private roleGuard: RoleGuard,
        // private invitationDeletedGuard: InvitationDeletedGuard,
        @Inject(PLATFORM_ID) private platformId
    ) {}

    
    // AuthGuard, DisabledGuard, RoleGuard
    async canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Promise<boolean> {

          
      let isBrowser = isPlatformBrowser(this.platformId)
      if(isBrowser) {
          // disabledGuard

          let enabled = await this.disabledGuard.canActivate(next, state)
          if(!enabled)
              return false
             

          let authed = await this.authGuard.canActivate()
          if(!authed) 
              return false

          
          let roleIsAllowed = await this.roleGuard.canActivate(next, state) 
          if(!roleIsAllowed)
              return false
      


          ///////////////////////////////////////////////////////////////////////////
          // ALL GOOD - the call has not ended - PROCEED TO /admin/vm
          return true
      }
      else {
          return true
      }


  }
  
}
