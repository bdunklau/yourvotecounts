import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoomService } from '../../room/room.service';
import { ErrorPageService } from '../../util/error-page/error-page.service';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class VideoProducingGuard implements CanActivate {

  constructor(
      private roomService: RoomService,
      private router: Router,
      private errorPageService: ErrorPageService,
  ) {}

  async canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Promise<boolean> {

      let roomSid = next.paramMap.get('RoomSid')

      /////////////////////////////////////////////////////////////////////
      // make sure there's a RoomSid path parameter
      if(!roomSid) {
          this.errorPageService.errorMsg = "That's a weird URL. Here's an error code that means nothing to you: E2001"
          this.router.navigate(['/error-page'])
          return false
      }


      /////////////////////////////////////////////////////////////////////
      // make sure it points to an actual Room doc in the 'room' collection
      let roomObj = await this.roomService.getRoomByRoomSid(roomSid)//.getRoomByRoomSid(roomSid)
      if(!roomObj) {
          this.errorPageService.errorMsg = "Strange stuff in that URL. Here's an error code that means nothing to you: E2002"
          this.router.navigate(['/error-page'])
          return false
      }


      ///////////////////////////////////////////////////////////////////////
      // make sure composition hasn't already been completed...
      if(roomObj.CompositionSid) {
          // yes, composition completed, so go to /view-video
          this.router.navigate(['/view-video', roomObj.CompositionSid])
          return false
      }


      /////////////////////////////////////////////////////////////////////////////
      // ALL GOOD - PROCEED TO /video-producing and camp out on that page if you like.  You'll see composition progress reported there
      // Pass the roomObj along to the component via the service obj
      this.roomService.roomObj = roomObj
      return true;

  }


}
