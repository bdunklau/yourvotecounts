import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { RoomObj } from '../../room/room-obj.model'
import { RoomService } from '../../room/room.service';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from 'src/app/user/user.model';
import * as _ from 'lodash'


@Component({
  selector: 'app-view-video',
  templateUrl: './view-video.component.html',
  styleUrls: ['./view-video.component.css']
})
export class ViewVideoComponent implements OnInit {

    //composition:any
    //url: string
    private routeSubscription: Subscription;
    //compositionSid: string
    //storageName: string
    videoUrl:string
    videoType:string
    room:RoomObj
    browser:string
    video_title:string
    video_description:string
    editing_title = false
    editing_description = false
    editing_allowed = false // if logged in and host or guest of video


    constructor(private afStorage: AngularFireStorage,
                private roomService: RoomService,
                private userService: UserService,
                private route: ActivatedRoute) { }


    async ngOnInit() {
        this.room = this.roomService.roomObj
        //this.videoUrl = this.room.videoUrl
        console.log("check this room:  ", this.room)
        this.browser = window.navigator.userAgent
        if(this.safari()) {
          this.videoUrl = this.room.videoUrl
          this.videoType = "application/x-mpegURL"
        }
        else {
          this.videoUrl = this.room.videoUrlAlt
          this.videoType = "video/mp4"
        }
        if(this.room.video_title) this.video_title = this.room.video_title
        if(this.room.video_description) this.video_description = this.room.video_description
        let user = await this.userService.getCurrentUser()
        if(this.allowedToEdit(user)) {
            this.editing_allowed = true
        }
    }

    private safari():boolean {
      // Detect Safari
      let safariAgent = window.navigator.userAgent.indexOf("Safari") > -1
      // Detect Chrome 
      let chromeAgent = window.navigator.userAgent.indexOf("Chrome") > -1
      if(!safariAgent) return false
      // Discard Safari since it also matches Chrome 
      if ((chromeAgent) && (safariAgent)) return false
      else return true
    }

    ngOnDestroy() {
      // if(this.routeSubscription) this.routeSubscription.unsubscribe();
    }
    
    async ngAfterViewInit() {
    }


    save_title() {
        this.roomService.saveVideoTitle(this.room.RoomSid, this.video_title)
        this.editing_title = false
    }


    save_description() {
        this.roomService.saveVideoDescription(this.room.RoomSid, this.video_description)
        this.editing_description = false
    }


    allowedToEdit(user: FirebaseUserModel): boolean {
        if(!user) return false
        if(user.phoneNumber == this.room.hostPhone)
            return true
        if(!this.room.guests || this.room.guests.length < 1)
            return false
        let foundMe = _.find(this.room.guests, guest => {
            return guest.guestPhone == user.phoneNumber
        }) 
        if(foundMe) return true
        else return false
    }


    beginEditTitle() {
        if(!this.editing_description)
            return // ignore user touch/click
        this.editing_title = true
    }


    beginEditDescription() {
        if(!this.editing_description)
            return // ignore user touch/click
        this.editing_description = true
    }


}
