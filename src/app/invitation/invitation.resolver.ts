import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { InvitationService } from './invitation.service';
import { Invitation } from './invitation.model';

@Injectable()
export class InvitationResolver implements Resolve<Invitation> {

  constructor(public invitationService: InvitationService, private router: Router) { }

  // TODO use guards instead
  async resolve(route: ActivatedRouteSnapshot) : Promise<Invitation> {
    // console.log('route.params[invitationId] = ',  route.params['invitationId']);
    const invitation = await this.invitationService.getInvitation(route.params['invitationId']);
    return invitation;
  }

}
