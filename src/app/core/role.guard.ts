import { Injectable,PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    public userService: UserService,
    @Inject(PLATFORM_ID) private platformId,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

      if(isPlatformBrowser(this.platformId)) {
          var user = await this.userService.getCurrentUser()

          if (user && user.hasRole(next.data.role)) {
              return true;
          }
          else {
              // navigate to home page
              this.router.navigate(['/home']);
              return false;
          }
      }
      else {
          this.router.navigate(['/home']);
          return false;
      }

  }
}
