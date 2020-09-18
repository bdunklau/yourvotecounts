import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SettingsService } from '../settings/settings.service'
import { UserService } from '../user/user.service';


@Injectable({
  providedIn: 'root'
})
export class PromoCodeGuard implements CanActivate {

    constructor(
        private settingsService: SettingsService,
        private userService: UserService,
        private router: Router,
    ) {}


    /**
     * Find out if user has a promo code - send to /promo-code if not
     */
    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {
          console.log('PromoCodeGuard')
          let user = await this.userService.getCurrentUser();
          if(!user || !user.promo_code) {
              this.router.navigate(['/promo-code'])
              return false
          }


        return true;
    }
  
}
