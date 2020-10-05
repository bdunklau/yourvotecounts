import { Component, OnInit, Optional, Inject, PLATFORM_ID } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { isPlatformServer } from '@angular/common';
import { RoomService } from '../room/room.service'; // TODO FIXME get rid of this
import { RoomObj } from '../room/room-obj.model'   // TODO FIXME get rid of this
import { Title, Meta } from '@angular/platform-browser';  // TODO FIXME get rid of this


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  room:RoomObj

  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private roomService: RoomService, // TODO FIXME get rid of this
    private metaTagService: Meta,   // TODO FIXME get rid of this
    @Optional() @Inject(REQUEST) private request: Request,) { }

  ngOnInit() {
    
      // TODO FIXME get rid of this
      // EVERYTHING IN THIS FUNCTION SHOULD GO
      // let rm = {
      //     CompositionSid: "CJcbb5d0bc0ababc87b4b81f6dbbbed3b0",
      //     RoomSid: "RMaabf5d419a80aea3a99b780978553609",
      //     created_ms: 1601691083926,
      //     guests: [{guestName: "asdfa", guestPhone: "+12146325613", joined_ms: 1601691089816}],
      //     hostId: "5U2FMF0239Xm4Bb1lrXk13SYGJi2",
      //     hostName: "Brent 555",
      //     hostPhone: "+15555555555",
      //     host_joined_ms: 1601691083926,
      //     host_left_ms: 1601691116171,
      //     invitationId: "mlYwiFi0wPzm5K09vCyD",
      //     call_ended_ms: 1601691116171,
      //     screenshotUrl: "https://storage.googleapis.com/yourvotecounts-dev.appspot.com/CJcbb5d0bc0ababc87b4b81f6dbbbed3b0/CJcbb5d0bc0ababc87b4b81f6dbbbed3b0.jpg",
      //     videoUrl: "https://storage.googleapis.com/yourvotecounts-dev.appspot.com/CJcbb5d0bc0ababc87b4b81f6dbbbed3b0/CJcbb5d0bc0ababc87b4b81f6dbbbed3b0.m3u8",
      //     videoUrlAlt: "https://storage.googleapis.com/yourvotecounts-dev.appspot.com/CJcbb5d0bc0ababc87b4b81f6dbbbed3b0/CJcbb5d0bc0ababc87b4b81f6dbbbed3b0-output.mp4",
      //     video_title: "Check THIS Out!",
      //     video_description: "HeadsUp!  Anybody can do this"
      //     //mark_time: {"start_recording_ms": number, "start_recording": string, "duration": string}[]
      //     //officials?: Official[]
      // } as RoomObj
      // this.roomService.roomObj = rm


      
      this.roomService.getRoomData("CJcbb5d0bc0ababc87b4b81f6dbbbed3b0"/*next.params.compositionSid*/).subscribe(obj => {
        
          if(obj && obj.length > 0) {
              console.log('HomeComponent:  got this from roomService: ', obj)
              let roomObj = obj[0].payload.doc.data() as RoomObj
              // hack? Don't know why functions aren't preserved when casting "as RoomObj" - so had to do this
              let rm = new RoomObj()
              roomObj.isHost = rm.isHost
              roomObj.isGuest = rm.isGuest


              
              // if(roomObj.video_title) this.titleService.setTitle(roomObj.video_title)
              // else this.titleService.setTitle('HeadsUp!')

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
                  console.log('HomeComponent: this.roomService.roomObj:  ', this.roomService.roomObj)
                  console.log('HomeComponent: return true')
                  // ob.next(true)  // this is how you pass a return value out of an observable
              }
              else {
                  console.log("HomeComponent: no videoUrl for this room - not expecting THAT")
                  // this.router.navigate(['/error-page'])
                  //ob.next(false)  // this is how you pass a return value out of an observable
              }
          }


      }) // end:   this.roomService.getRoomData("C



      // FYI this is how you get the host:port from the server
      if (isPlatformServer(this.platformId)) {
        //  console.log('this.request.headers:  ', this.request.headers['x-forwarded-host'])
      }
  }

}
