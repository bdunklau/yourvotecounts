import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RoomService } from '../../room/room.service';
import { RoomObj } from '../../room/room-obj.model';


@Injectable({
  providedIn: 'root'
})
export class VideoReadyGuard implements CanActivate {

  constructor(
    public roomService: RoomService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    if(!next.params.compositionSid) {
      this.router.navigate(['/error-page'])
      return false
    }
    
    let obj = await this.roomService.getRoomData(next.params.compositionSid)
    if(obj && obj.length > 0) {
      let roomObj = obj[0].payload.doc.data() as RoomObj

      // hack? Don't know why functions aren't preserved when casting "as RoomObj" - so had to do this
      let rm = new RoomObj()
      roomObj.isHost = rm.isHost
      roomObj.isGuest = rm.isGuest

      console.log('ths.roomService.roomObj.:  ', this.roomService.roomObj)
      if(roomObj.videoUrl) {
        this.roomService.roomObj = roomObj

        return true;
      }
    }
    
    this.router.navigate(['/error-page'])
    return false   

  }
}