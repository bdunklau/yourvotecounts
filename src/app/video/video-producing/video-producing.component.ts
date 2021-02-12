import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomObj } from '../../room/room-obj.model';
import { RoomService } from '../../room/room.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-video-producing',
  templateUrl: './video-producing.component.html',
  styleUrls: ['./video-producing.component.css']
})
export class VideoProducingComponent /*implements OnInit*/ {

    /**
     * All of this code can probably be deleted because of
     * https://headsupvideo.atlassian.net/browse/HEADSUP-53
     */

    // compositionInProgress: boolean = false
    // roomObj: RoomObj
    // private roomSubscription: Subscription;


    // constructor(
    //   private roomService: RoomService,
    //   private router: Router,) { }

    // ngOnInit() {      
    //     this.roomObj = this.roomService.roomObj
    //     this.monitorRoom(this.roomObj.RoomSid) // guaranteed by the VideoProducingGuard
    // }

    
    // ngOnDestroy() {
    //     if(this.roomSubscription) this.roomSubscription.unsubscribe()
    //     // console.log('VideoProducingComponent:ngOnDestroy()')
    // }


    // /**
    //  * Monitor the room object for the composition progress
    //  * And detect when CompositionSid becomes present - because that indicates the composition is done and
    //  * we can send the user on to the /view-video page
    //  * @param roomSid 
    //  */
    // monitorRoom(roomSid: string) {
  
    //   this.roomSubscription = this.roomService.monitorRoom(roomSid).subscribe(res => {
    //     if(res.length > 0) { 
    //         this.roomObj = res[0].payload.doc.data() as RoomObj
            
    //         // means the video is ready, move on to the next page
    //         if(this.roomObj.CompositionSid) {
    //             // do what VideoCallCompleteGuard does: redirects to /view-video
    //             this.router.navigate(['/view-video', this.roomObj.CompositionSid])
    //         }
  
    //     }
    //   })
      
    // }

}
