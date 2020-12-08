import { Injectable,PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard implements CanActivate {

  constructor(
    public userService: UserService,
    @Inject(PLATFORM_ID) private platformId,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
      if(isPlatformBrowser(this.platformId)) {
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
}
