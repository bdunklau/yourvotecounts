import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    public userService: UserService,
    private router: Router
  ) {}


  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    try {
      var user = await this.userService.getCurrentUser()

      console.log("canActivate(): user = ", user)
      if(user && !user.displayName) {
        this.router.navigate(['/register']);
        return false
      } else if(user) {
        this.router.navigate(['/user']);
        return false
      }
      else return true;
    } catch(e) {
      return true;
    }
  }
}
