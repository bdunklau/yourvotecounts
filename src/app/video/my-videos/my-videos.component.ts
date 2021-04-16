import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RoomService } from '../../room/room.service';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from '../../user/user.model';
import { RoomObj } from '../../room/room-obj.model'
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';


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
    videos: RoomObj[]
    videoType: string 
    translated = false
    collapsed = false
    selectedRoom: RoomObj
    confirmingDelete = false
    whose = 'My'


    constructor(private roomService: RoomService,
                private route: ActivatedRoute,
                @Inject(PLATFORM_ID) private platformId,
                private userService: UserService) { }

    async ngOnInit() {
        /**
         * query on an attribute that's an array
         * https://fireship.io/lessons/firestore-array-queries-guide/
         */

        //  this.roomService.copyRoom('RM2dbf25feca76a26e287d0c5ec4694707')  get rid of this temp code

        if(isPlatformBrowser(this.platformId)) {
            let user = await this.getTheUser()
            let me = await this.userService.getCurrentUser()
            if(user.displayName != me.displayName) this.whose = user.displayName+"'s"
            this.videos = await this.roomService.getVideos(user.phoneNumber)
        }

    }

    private async getTheUser() {
        if(this.route.snapshot.params.uid) {
            // args = {uid: this.route.snapshot.params.uid}
            return await this.userService.getUserById(this.route.snapshot.params.uid)
            // this.whose = user.displayName+"'s"
        }   
        return await this.userService.getCurrentUser() 
    }

    openVideoControlMenu(room: RoomObj) {
        this.translated = true
        this.selectedRoom = room
    }


    async deleteVideo() {
        if(this.confirmingDelete) {
            console.log('deleteVideo()')
            await this.roomService.deleteRoom(this.selectedRoom)
            this.confirmingDelete = false
            this.translated = false
        }
        else {
            this.confirmingDelete = true
        }
    }

}
