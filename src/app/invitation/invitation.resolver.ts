import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { InvitationService } from './invitation.service';
import { Invitation } from './invitation.model';

@Injectable()
export class InvitationResolver implements Resolve<{invitation: Invitation, phoneNumber: string, isHost: boolean, join: boolean}> {

  constructor(public invitationService: InvitationService, private router: Router) { }

  // TODO use guards instead
  async resolve(route: ActivatedRouteSnapshot) : Promise<{invitation: Invitation, phoneNumber: string, isHost: boolean, join: boolean}> {
    /********************
    // console.log('route.params[invitationId] = ',  route.params['invitationId']);
    const invitation = await this.invitationService.getInvitation(route.params['invitationId']);
    const phoneNumber = route.params['phoneNumber'];
    const join = "join" === route.params['join'] ? true : false
    let isHost = false;
    if(phoneNumber === invitation.creatorPhone)
      isHost = true
    return {invitation: invitation, phoneNumber: route.params['phoneNumber'], isHost: isHost, join: join};
    ******************/
    
    // TODO FIXME just temporary - remove this resolver
    return {invitation: null, phoneNumber: null, isHost: null, join: null};
  }

}
