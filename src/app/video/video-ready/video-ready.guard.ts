
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
    state: RouterStateSnapshot): Observable<boolean> {


    /////////////////////////////////////////////////////////////////////////////////////////////////
    // TODO FIXME below here is what's causing the holdup
    
    //let isBrowser = isPlatformBrowser(this.platformId)

    
    // this.metaTagService.addTags([
    //   { name: 'keywords', content: 'Angular SEO Integration - did this work' },
    //   { name: 'robots', content: 'index, follow' },
    //   { name: 'author', content: 'Digamber Singh' },
    //   { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    //   { name: 'date', content: '2019-10-31', scheme: 'YYYY-MM-DD' },
    //   { charset: 'UTF-8' }
    // ]);

    

    /**
     * Angular Universal doesn't seem to handle .toPromise() in Sept 2020
     * @see  https://github.com/angular/angularfire/issues/2420
     * But we can subscribe.  Just more of a hassle, more code to write
     */
    return new Observable<boolean>(ob => {

        // if(!next.params.compositionSid) {
        //     this.router.navigate(['/error-page'])
        //     ob.next(false) // this is how you pass a return value out of an observable
        // }
            
        this.roomService.getRoomData(next.params.compositionSid).subscribe(obj => {
            // if(!obj || obj.length < 1) {
            //     this.router.navigate(['/error-page'])
            //     ob.next(false) // this is how you pass a return value out of an observable
            // }
            // else { 
            if(obj && obj.length > 0) {
                console.log('got this from roomService: ', obj)
                let roomObj = obj[0].payload.doc.data() as RoomObj
                // hack? Don't know why functions aren't preserved when casting "as RoomObj" - so had to do this
                let rm = new RoomObj()
                roomObj.isHost = rm.isHost
                roomObj.isGuest = rm.isGuest


                
                if(roomObj.video_title) this.titleService.setTitle(roomObj.video_title)
                else this.titleService.setTitle('HeadsUp!')

                this.metaTagService.addTags([
                    { name: 'keywords', content: 'HeadsUp video elected officials candidates for office' },
                    { name: 'robots', content: 'index, follow' },
                    { name: 'author', content: 'genius' },
                    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                    { property: 'og:image', content: roomObj.screenshotUrl },
                    { name: 'date', content: '2019-10-31', scheme: 'YYYY-MM-DD' },
                    { charset: 'UTF-8' }
                ]);







                if(roomObj.videoUrl) {
                    this.roomService.roomObj = roomObj
                    console.log('VideoReadyGuard: this.roomService.roomObj:  ', this.roomService.roomObj)
                    console.log('VideoReadyGuard: return true')
                    ob.next(true)  // this is how you pass a return value out of an observable
                }
                else {
                    this.router.navigate(['/error-page'])
                    ob.next(false)  // this is how you pass a return value out of an observable
                }
            }
            // }  // end:   else


        })
    })



      // let obj = await this.roomService.getRoomData(next.params.compositionSid)
      // console.log('VideoReadyGuard: after await')
      // if(obj && obj.length > 0) {
      //     console.log('VideoReadyGuard: inside if')
      //     let roomObj = obj[0].payload.doc.data() as RoomObj

      //     // hack? Don't know why functions aren't preserved when casting "as RoomObj" - so had to do this
      //     let rm = new RoomObj()
      //     roomObj.isHost = rm.isHost
      //     roomObj.isGuest = rm.isGuest

      //     if(roomObj.videoUrl) {
      //       this.roomService.roomObj = roomObj
      //       console.log('VideoReadyGuard: this.roomService.roomObj.:  ', this.roomService.roomObj)
      //       console.log('VideoReadyGuard: return true')
      //       return true;
      //     }
      //     console.log('VideoReadyGuard: end if - where is return?')
      // }
      
      // this.router.navigate(['/error-page'])
      // console.log('VideoReadyGuard: return false')
      // return false   



  }
}
