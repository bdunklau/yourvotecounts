import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

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
        if(!user) return false;
        if(!user.displayName) {
          this.router.navigate(['/register']);
          return false;
        }
        else return true;
      } catch(e) {
        return false;
      }
  }
}
