import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DisabledGuard } from '../../disabled/disabled.guard';
import { AuthGuard } from '../../core/auth.guard';
import { MinimalAccountInfoGuard } from '../../my-account/minimal-account-info/minimal-account-info.guard';
import { PromoCodeGuard } from '../../promo-code/promo-code.guard';
import { SettingsService } from 'src/app/settings/settings.service';


@Injectable({
  providedIn: 'root'
})
export class InvitationFormGuard implements CanActivate {

    constructor(
        // private roomService: RoomService,
        // private invitationService: InvitationService,
        // private router: Router,
        // private errorPageService: ErrorPageService,
        // private invitationGuard: ValidInvitationGuard,
        private settingsService: SettingsService,
        private disabledGuard: DisabledGuard,
        private authGuard: AuthGuard,
        private minimalAccountInfoGuard: MinimalAccountInfoGuard,
        private promoCodeGuard: PromoCodeGuard
    ) {}


    async canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Promise<boolean> {


        // chain these:  AuthGuard, DisabledGuard, MinimalAccountInfoGuard   PromoCodeGuard         

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
            this.settingsService.continuePath = '/invitation-form'
            return false
        }

        return true
    }
  
}
