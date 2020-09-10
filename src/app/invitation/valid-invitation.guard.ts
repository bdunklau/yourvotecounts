import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { InvitationService } from './invitation.service';
import { ErrorPageService } from '../util/error-page/error-page.service';
import * as _ from 'lodash'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class ValidInvitationGuard implements CanActivate {

  constructor(
    public invitationService: InvitationService,
    private errorPageService: ErrorPageService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    let invId = next.params['invitationId'];
    let phoneNumber = next.params['phoneNumber'];

    //////////////////////////////////////////////////////////////////////////////
    // INVITATION MUST EXIST
    let invitations = await this.invitationService.getInvitations(invId)
    if(invitations.length < 1) {
      this.errorPageService.errorMsg = "That URL doesn't make any sense"
      this.router.navigate(['/error-page'])
      console.log('ValidInvitationGuard: no invitation found')
      return false
    }


    ///////////////////////////////////////////////////////////////////////////////
    // INVITATION MUST CONTAIN THE PHONE NUMBER
    let foundInvitation = _.find(invitations, inv => {
      return inv.creatorPhone == phoneNumber || inv.phoneNumber == phoneNumber
    })
    if(!foundInvitation) {
      this.errorPageService.errorMsg = "Uh...  how'd you get *that* URL?"
      this.router.navigate(['/error-page'])
      console.log('ValidInvitationGuard: phone number is wrong')
      return false
    }

    this.invitationService.invitation = foundInvitation
    
    return true;
  }
}
