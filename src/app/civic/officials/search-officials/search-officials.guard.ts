import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuard } from '../../../core/auth.guard'
import { DisabledGuard } from '../../../disabled/disabled.guard'
import { SettingsGuard } from '../../../settings/settings.guard'


@Injectable({
  providedIn: 'root'
})
export class SearchOfficialsGuard implements CanActivate {

  
  /**
   * Notice how we're injecting other guards into THIS guard
   * @param authGuard 
   * @param disabledGuard 
   */
  constructor(
    //private roomService: RoomService,
    //private invitationService: InvitationService,
    //private router: Router,
    //private errorPageService: ErrorPageService,
    //private authGuard: AuthGuard,  // I don't care if you're signed in just to search officials
    private disabledGuard: DisabledGuard,
    private settingsGuard: SettingsGuard
  ) {}


  
    // see:   VideoCallCompleteGuard  for another example of injecting guards
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {      

      // I don't care if you're signed in just to search officials
      /******
      let ok = await this.authGuard.canActivate();
      if(!ok) {
          return false
      }
      ********/

      let enabled = await this.disabledGuard.canActivate(next, state)
      if(!enabled) {
          return false
      }

      let ok = await this.settingsGuard.canActivate(next, state)
      if(!ok) {
          return false // should never happen 9/13/20
      }

      return true

  }
  
}
