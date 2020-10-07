
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RoomService } from '../../room/room.service';
import { RoomObj } from '../../room/room-obj.model';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class VideoReadyGuard implements CanActivate {

  constructor(
    public roomService: RoomService,
    private metaTagService: Meta,
    private titleService: Title,
    @Inject(PLATFORM_ID) private platformId,
    private router: Router
  ) {}

  canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Promise<boolean> {

      console.log('VideoReadyGuard:  begin')
        
      let isBrowser = isPlatformBrowser(this.platformId)
      if(isBrowser) {

            return this.roomService.getRoomData(next.params.compositionSid).toPromise()
            .then(obj => {
                console.log('got this from roomService: ', obj)
                if(obj && obj.length > 0) {
                    let roomObj = obj[0].payload.doc.data() as RoomObj
                    // hack? Don't know why functions aren't preserved when casting "as RoomObj" - so had to do this
                    let rm = new RoomObj()
                    roomObj.isHost = rm.isHost
                    roomObj.isGuest = rm.isGuest


                    if(roomObj.videoUrl) {
                        this.roomService.roomObj = roomObj
                        console.log('VideoReadyGuard: this.roomService.roomObj:  ', this.roomService.roomObj)
                        console.log('VideoReadyGuard: return true')
                        return Promise.resolve(true)
                    }
                    else {
                        this.router.navigate(['/error-page'])
                        return Promise.resolve(false)
                    }

                }
                else {
                    console.log('VideoReadyGuard:  else - not good 1')
                    this.router.navigate(['/error-page'])
                    return Promise.resolve(false)
                }


            })
            
      }
      else {
          return Promise.resolve(true)
      }




        


    }
}
