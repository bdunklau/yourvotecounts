import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { InvitationService } from '../invitation.service';
import * as _ from 'lodash'
import { Invitation } from '../invitation.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class InvitationDeletedGuard implements CanActivate {

    constructor(
      public invitationService: InvitationService,
      //private errorPageService: ErrorPageService,
      private router: Router
    ) {}


    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> {

        return new Observable<boolean>(ob => {
            if(!this.invitationService.invitations || this.invitationService.invitations.length == 0) {
                // doesn't really mean "good", just means he didn't determine invitations have been deleted
                ob.next(true); // how you return values from observables
            }

            let deleted = 0;
            _.each(this.invitationService.invitations, (inv:Invitation) => {
                if(inv.deleted_ms != -1) deleted++
            })
            if(deleted == this.invitationService.invitations.length) {
                this.router.navigate(['/invitation-deleted'])
                ob.next(false); // how you return values from observables
            }

            ob.next(true); // how you return values from observables
            
        })

            
    }


    ////////////////////////////////////////////////////////////////////
    // REPLACING WITH VERSION ABOVE THAT RETURNS AN OBSERVABLE, NOT A PROMISE BECAUSE ANGULAR UNIVERSAL DOESN'T SEEM TO LIKE PROMISES
    // async canActivate(
    //     next: ActivatedRouteSnapshot,
    //     state: RouterStateSnapshot): Promise<boolean> {

    //     if(!this.invitationService.invitations || this.invitationService.invitations.length == 0) {
    //         // doesn't really mean "good", just means he didn't determine invitations have been deleted
    //         return true;
    //     }

    //     let deleted = 0;
    //     _.each(this.invitationService.invitations, (inv:Invitation) => {
    //         if(inv.deleted_ms) deleted++
    //     })
    //     if(deleted == this.invitationService.invitations.length) {
    //         this.router.navigate(['/invitation-deleted'])
    //         return false
    //     }

    //     return true;
    // }
  
}
