import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';

@Injectable()
export class UserResolver implements Resolve<FirebaseUserModel> {

  constructor(public userService: UserService,
              @Inject(PLATFORM_ID) private platformId,
              private router: Router) { }

  // TODO use guards instead
  async resolve(route: ActivatedRouteSnapshot) : Promise<FirebaseUserModel> {
    if(isPlatformBrowser(this.platformId)) {
        let user = await this.userService.getCurrentUser();
        if(!user) {
          console.log('UserResolver.resolve(): No user object');
          this.router.navigate(['/login']);
          return null;
        }

        // replaced by MinimalAccountInfoGuard
        // if(!user.displayName) {
        //   this.router.navigate(['/myaccount']);
        //   return null;
        // }
        return user;
    }
  }

}
