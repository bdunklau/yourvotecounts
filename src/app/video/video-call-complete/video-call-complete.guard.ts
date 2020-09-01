import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RoomService } from '../../room/room.service';


/**
 * We call this guard to see if the video has already been created/produced.  If it has, then we redirect the users
 * to a screen where they can watch the video
 * 
 * How do we know if the video has already been created?  
 * Ans:  Look for CompositionSid in the room doc.  If CompositionSid exists, then that room and invitation can't be used anymore
 * 
 * How:  Query the room collection by invitationId.  That will return a room doc.  The room doc MAY have a CompositionSid field.
 * 
 * See the /video-call routes
 */
@Injectable({
  providedIn: 'root'
})
export class VideoCallCompleteGuard implements CanActivate {

    constructor(
        public roomService: RoomService,
        private router: Router
    ) {}

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

          console.log('CHECK next.paramMap.get(\'invitationId\'): ', next.paramMap.get('invitationId'))

        let roomRef = this.roomService.getRoom(next.paramMap.get('invitationId'))
        roomRef.subscribe(room => {
            console.log('CHECK room: ', room[0].payload.doc.data())
            if(room && room.length > 0 && room[0].payload.doc.data()['CompositionSid']) {
                this.router.navigate(['/view-video', room[0].payload.doc.data()['CompositionSid']]);
                return false
            }
            else return true
        })

        console.log('CHECK return true')
        return true;

        /************
        if (user && user.hasRole(next.data.role)) {
          return true;
        }

        // navigate to home page
        this.router.navigate(['/']);
        return false;
        ************/
    }
  
}
