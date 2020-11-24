import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RoomService } from 'src/app/room/room.service';
import { UserService } from 'src/app/user/user.service';
import { FirebaseUserModel } from 'src/app/user/user.model';
import { RoomObj } from '../../room/room-obj.model'
import { isPlatformBrowser } from '@angular/common';


/**
 * ng g c video/my-videos --module app
 */
@Component({
  selector: 'app-my-videos',
  templateUrl: './my-videos.component.html',
  styleUrls: ['./my-videos.component.css']
})
export class MyVideosComponent implements OnInit {

    me: FirebaseUserModel
    asGuest: RoomObj[]
    asHost: RoomObj[]
    videoType: string 


    constructor(private roomService: RoomService,
                @Inject(PLATFORM_ID) private platformId,
                private userService: UserService) { }

    async ngOnInit() {
        /**
         * query on an attribute that's an array
         * https://fireship.io/lessons/firestore-array-queries-guide/
         */

        //  this.roomService.copyRoom('RM2dbf25feca76a26e287d0c5ec4694707')  get rid of this temp code

        if(isPlatformBrowser(this.platformId)) {
            this.me = await this.userService.getCurrentUser()
            
            this.asGuest = await this.roomService.getRoomsWithGuest({guestName: this.me.displayName, guestPhone: this.me.phoneNumber})
            this.asHost = await this.roomService.getRoomsWithHost({uid: this.me.uid})
        }

    }

}
