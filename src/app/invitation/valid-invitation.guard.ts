import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { InvitationService } from './invitation.service';
import { ErrorPageService } from '../util/error-page/error-page.service';
import * as _ from 'lodash'

@Injectable({
  providedIn: 'root'
})
export class ValidInvitationGuard implements CanActivate {

  constructor(
    public invitationService: InvitationService,
    private errorPageService: ErrorPageService,
    private router: Router
  ) {}


  // try: no async, return observal instead
  canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean> {

      let invId = next.params['invitationId'];
      let phoneNumber = next.params['phoneNumber'];
      
      return new Observable<boolean>(ob => { 

          //////////////////////////////////////////////////////////////////////////////
          // INVITATION MUST EXIST
          this.invitationService.getInvitations(invId).subscribe(invitations => {

              if(invitations.length < 1) {
                this.errorPageService.errorMsg = "That URL doesn't make any sense"

                // see video-call.guard.ts - that's where we send to /error-page
                // For some reason, angular universal doesn't honor the call below, so we have to do the navigate()
                // in any guard that calls this guard - hassle
                // this.router.navigate(['/error-page'])
                console.log('ValidInvitationGuard: no invitation found')
                ob.next(false) // this is how you pass a return value out of an observable
              }
              else {
                  //this.invitationService.invitations = invitations // now go see VideoCallComponent
                  console.log('this.invitationService.invitations = ', this.invitationService.invitations)
                  ob.next(true) // this is how you pass a return value out of an observable
              }

          })







      })




      // //////////////////////////////////////////////////////////////////////////////
      // // INVITATION MUST EXIST
      // let invitations = await this.invitationService.getInvitations(invId)
      // if(invitations.length < 1) {
      //   this.errorPageService.errorMsg = "That URL doesn't make any sense"
      //   this.router.navigate(['/error-page'])
      //   console.log('ValidInvitationGuard: no invitation found')
      //   return false
      // }
    
      // //this.invitationService.invitations = invitations // now go see VideoCallComponent
      // console.log('this.invitationService.invitations = ', this.invitationService.invitations)
 
      // return true;

  }

  

  // async canActivate(
  //     next: ActivatedRouteSnapshot,
  //     state: RouterStateSnapshot): Promise<boolean> {

  //     let invId = next.params['invitationId'];
  //     let phoneNumber = next.params['phoneNumber'];

  //     //////////////////////////////////////////////////////////////////////////////
  //     // INVITATION MUST EXIST
  //     let invitations = await this.invitationService.getInvitations(invId)
  //     if(invitations.length < 1) {
  //       this.errorPageService.errorMsg = "That URL doesn't make any sense"
  //       this.router.navigate(['/error-page'])
  //       console.log('ValidInvitationGuard: no invitation found')
  //       return false
  //     }
    
  //     //this.invitationService.invitations = invitations // now go see VideoCallComponent
  //     console.log('this.invitationService.invitations = ', this.invitationService.invitations)

  //     return true;
  // }
}
