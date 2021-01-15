
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RoomService } from '../../room/room.service';
import { RoomObj } from '../../room/room-obj.model';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient  } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class VideoReadyGuard implements CanActivate {

  constructor(
    public roomService: RoomService,
    @Inject(PLATFORM_ID) private platformId,
    private router: Router
  ) {}

  async canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Promise<boolean> {

      console.log('VideoReadyGuard:  begin')
        
      let isBrowser = isPlatformBrowser(this.platformId)
      if(isBrowser) {
            this.roomService.getIp()
            // this.roomService.updateViews(next.params.compositionSid, ipAddress)

            let obj = await this.roomService.getRoomData(next.params.compositionSid).toPromise()
            if(obj && obj.length > 0) {
                let roomObj = obj[0].payload.doc.data() as RoomObj
                // hack? Don't know why functions aren't preserved when casting "as RoomObj" - so had to do this
                let rm = new RoomObj()
                roomObj.isHost = rm.isHost
                roomObj.isGuest = rm.isGuest

                if(roomObj.videoUrl) {
                    this.roomService.roomObj = roomObj
                    // this.roomService.roomObj.views = 9090
                    // let viewCount = this.roomService.viewed(roomObj, resp.ip)
                    console.log('VideoReadyGuard: this.roomService.roomObj:  ', this.roomService.roomObj)
                    console.log('VideoReadyGuard: return true')
                    return true
                }
                else {
                    this.router.navigate(['/error-page'])
                    return false
                }

            }
            else {
                console.log('VideoReadyGuard:  else - not good 1')
                this.router.navigate(['/error-page'])
                return false
            }






            // return this.roomService.getRoomData(next.params.compositionSid).toPromise()
            // .then(obj => {
            //     console.log('got this from roomService: ', obj)
            //     if(obj && obj.length > 0) {
            //         let roomObj = obj[0].payload.doc.data() as RoomObj
            //         // hack? Don't know why functions aren't preserved when casting "as RoomObj" - so had to do this
            //         let rm = new RoomObj()
            //         roomObj.isHost = rm.isHost
            //         roomObj.isGuest = rm.isGuest


            //         if(roomObj.videoUrl) {
            //             this.roomService.roomObj = roomObj
            //             console.log('VideoReadyGuard: this.roomService.roomObj:  ', this.roomService.roomObj)
            //             console.log('VideoReadyGuard: return true')
            //             return true
            //         }
            //         else {
            //             this.router.navigate(['/error-page'])
            //             return false
            //         }

            //     }
            //     else {
            //         console.log('VideoReadyGuard:  else - not good 1')
            //         this.router.navigate(['/error-page'])
            //         return false
            //     }


            // })
            
      }
      else {
          return true
      }




        


    }
}
