import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../user/user.service';

@Injectable({
  providedIn: 'root'
})

// Created with angular cli:
//  ng g g my-account/minimal-account-info/minimal-account-info
//
// Make sure that the user's account has the minimum required info:
// displayName set
// TOS accepted
// Privacy Policy read
export class MinimalAccountInfoGuard implements CanActivate {

    constructor(
        public userService: UserService,
        @Inject(PLATFORM_ID) private platformId,
        private router: Router,
    ) {}


    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

        if(isPlatformBrowser(this.platformId)) {
            let hasMinimalInfo:boolean = await this.hasMinimalInfo();
            if(!hasMinimalInfo) {
              this.router.navigate(['/minimal-account-info']);
              return false;
            }
            else return true;
        }
        else return true;  // false will hang the server server-side
    }

    async hasMinimalInfo():Promise<boolean> {
        // must have displayName set
        // must have accepted the TOS
        var user = await this.userService.getCurrentUser();
        var nameGood = false;
        if(user && user.displayName) nameGood = true;

        var tosAccepted = false;
        if(user && user.tosAccepted) tosAccepted = true;

        var privacyPolicyRead = false;
        if(user && user.privacyPolicyRead) privacyPolicyRead = true;
        console.log('hasMinimalInfo: nameGood=',nameGood,'  tosAccepted=',tosAccepted,' privacyPolicyRead=',privacyPolicyRead);
        return nameGood && tosAccepted && privacyPolicyRead;
    }
}
