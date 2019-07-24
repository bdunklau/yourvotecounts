import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
// CREATED VIA ANGULAR CLI:  ng g g disabled
export class DisabledGuard implements CanActivate {

  constructor(
    public userService: UserService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    try {
      var user = await this.userService.getCurrentUser()

      // if there's no user, then send the user to /login and return false
      // otherwise return true
      if(!user || user.isDisabled) {
        this.router.navigate(['/disabled']);
        return false
      }
      else return true;
    } catch(e) {
      return false;
    }

  }
}
