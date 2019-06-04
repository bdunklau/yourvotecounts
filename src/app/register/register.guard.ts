import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../core/user.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard implements CanActivate {

  constructor(
    public userService: UserService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
      try {
        var user = await this.userService.getCurrentUser()

        console.log("RegisterGuard:canActivate(): user = ", user)
        if(!user) {
          this.router.navigate(['/login']);
          return false
        }
        else return true;
      } catch(e) {
        console.log("RegisterGuard:canActivate(): error = ", e)
        this.router.navigate(['/login']);
        return true;
      }
  }
}
