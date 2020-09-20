import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { InvitationService } from '../invitation.service';
import * as _ from 'lodash'
import { Invitation } from '../invitation.model';


@Injectable({
  providedIn: 'root'
})
export class InvitationDeletedGuard implements CanActivate {

    constructor(
      public invitationService: InvitationService,
      //private errorPageService: ErrorPageService,
      private router: Router
    ) {}


    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

        if(!this.invitationService.invitations || this.invitationService.invitations.length == 0) {
            // doesn't really mean "good", just means he didn't determine invitations have been deleted
            return true;
        }

        let deleted = 0;
        _.each(this.invitationService.invitations, (inv:Invitation) => {
            if(inv.deleted_ms) deleted++
        })
        if(deleted == this.invitationService.invitations.length) {
            this.router.navigate(['/invitation-deleted'])
            return false
        }

        return true;
    }
  
}
