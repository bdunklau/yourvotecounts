import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
// CREATED VIA ANGULAR CLI:  ng g g disabled
export class DisabledGuard implements CanActivate {

  constructor(
    public userService: UserService,
    private router: Router,
    private settingsService: SettingsService,
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    try {
      var user = await this.userService.getCurrentUser();
      var globalDisabled = await this.settingsService.isDisabled();
      console.log('globalDisabled = ', globalDisabled);

      // RULE: admins cannot be disabled via the global setting
      // RULE: admins CAN be disabled individually
      // RULE: But you can't disable your own account
      var all = globalDisabled && !user.hasRole('admin');

      // if there's no user, then send the user to /login and return false
      // otherwise return true
      if(!user || user.isDisabled || all) {
        this.router.navigate(['/disabled']);
        return false
      }
      else return true;
    } catch(e) {
      return false;
    }

  }
}