import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router } from "@angular/router";
import { UserService } from '../user/user.service';


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        public userService: UserService,
        @Inject(PLATFORM_ID) private platformId,
        private router: Router
    ) {}

    async canActivate(): Promise<boolean> {
        if(isPlatformBrowser(this.platformId)) {
            try {
              var user = await this.userService.getCurrentUser()

              // if there's no user, then send the user to /login and return false
              // otherwise return true
              if(!user) {
                this.router.navigate(['/login']);
                return false
              }
              else return true;
            } catch(e) {
              return false;
            }
        }
        else return true; // should the default be false on the server?

    }


}
