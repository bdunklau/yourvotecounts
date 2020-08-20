import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { InvitationService } from './invitation.service';

@Injectable({
  providedIn: 'root'
})
export class ValidInvitationGuard implements CanActivate {

  constructor(
    public invitationService: InvitationService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    let invId = next.params['invitationId'];
    let phoneNumber = next.params['phoneNumber'];
    //console.log('invitationId = ', invId);
    let invitation = await this.invitationService.getInvitation(invId);
    //console.log('invitation = ', invitation);
    let badUrl = !invitation || !phoneNumber || (phoneNumber != invitation.phoneNumber && phoneNumber != invitation.creatorPhone)
    if(badUrl) {
      this.router.navigate(['/error-page']);
      return false;      
    }
    else {

    }
    return true;
  }
}
