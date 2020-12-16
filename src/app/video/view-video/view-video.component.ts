import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { RoomObj } from '../../room/room-obj.model'
import { RoomService } from '../../room/room.service';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from 'src/app/user/user.model';
import * as _ from 'lodash'
import { Official } from '../../civic/officials/view-official/view-official.component'
import { isPlatformBrowser } from '@angular/common';
import { MessageService } from 'src/app/core/message.service';


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
    collapsed = false
    translated = false
    private official_selected_sub: Subscription
    private official_deleted_sub: Subscription
    isHost = false
    isGuest = false
    initialized = false
    showAd = false
    private userSubscription: Subscription;


    constructor(private roomService: RoomService,
                private userService: UserService,
                private messageService: MessageService,
                @Inject(PLATFORM_ID) private platformId,
                //private _modalService: NgbModal,
                private route: ActivatedRoute) {
                    

            var nxt = function(user /* FirebaseUserModel */) {     
                let allowed = this.allowedToEdit(user)
                if(allowed) {
                    this.editing_allowed = true
                }
                this.listenForOfficials()
                this.isHost = this.room.isHost(user)
                this.isGuest = this.room.isGuest(user)
            }.bind(this);

            this.userSubscription = this.messageService.listenForUser().subscribe({
                next: nxt,
                error: function(value) {
                },
                complete: function() {
                }
            })
    }


    async ngOnInit() {

        try {
            this.room = this.roomService.roomObj
            this.videoUrl = this.room.videoUrl
        } catch(err) { 
            /**
             * server console was spitting out a mile of stack crap because the room object wasn't available right here.
             * I tried moving the 2 lines above down inside the if(isBrowser) block - for some reason that caused the video
             * to not be play-able.  So I moved this code back up here but wrapped in a try/catch because the giant error was just
             * annoying and served no purpose
             */
            console.log('better error? :)') 
        }


        console.log('isPlatformBrowser(this.platformId)...')
        let isBrowser = isPlatformBrowser(this.platformId)
        console.log('isPlatformBrowser(this.platformId) = ', isBrowser)
        
        if(isBrowser) {

            // is there an 'ad' parameter?  If so, show the banner ad - doesn't matter what the value of the parameter is
            if(this.route.snapshot.queryParams.ad) {
                this.showAd = true
            }

            let safari = function() {
                // Detect Safari
                let safariAgent = window.navigator.userAgent.indexOf("Safari") > -1
                // Detect Chrome 
                let chromeAgent = window.navigator.userAgent.indexOf("Chrome") > -1
                if(!safariAgent) return false
                // Discard Safari since it also matches Chrome 
                if ((chromeAgent) && (safariAgent)) return false
                else return true
            }

            // this.browser = window.navigator.userAgent
            if(safari()) {
                this.videoUrl = this.room.videoUrl
                this.videoType = "application/x-mpegURL"
            }
            else {
                this.videoUrl = this.room.videoUrlAlt
                this.videoType = "video/mp4"
            }
            if(this.room.video_title) this.video_title = this.room.video_title
            if(this.room.video_description) this.video_description = this.room.video_description
            this.initialized = true
        }
        console.log('ngOnInit():  done')

    }



    // private safari():boolean {
    //   // Detect Safari
    //   let safariAgent = window.navigator.userAgent.indexOf("Safari") > -1
    //   // Detect Chrome 
    //   let chromeAgent = window.navigator.userAgent.indexOf("Chrome") > -1
    //   if(!safariAgent) return false
    //   // Discard Safari since it also matches Chrome 
    //   if ((chromeAgent) && (safariAgent)) return false
    //   else return true
    // }

    ngOnDestroy() {
        if(this.official_selected_sub) this.official_selected_sub.unsubscribe();
        if(this.official_deleted_sub) this.official_deleted_sub.unsubscribe();
        if(this.userSubscription) this.userSubscription.unsubscribe();
    }
    
    async ngAfterViewInit() {
        console.log('ngAfterViewInit():  done')
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
        if(user['phoneNumber'] === this.room.hostPhone) {
            return true
        }
        else {
            return false
        }
    }


    beginEditTitle() {
        if(!this.editing_allowed)
            return // ignore user touch/click
        this.editing_title = true
    }


    beginEditDescription() {
        if(!this.editing_allowed)
            return // ignore user touch/click
        this.editing_description = true
    }


    // opens a modal to /search-officials
    openOfficialDialog() {
        // this.showOkCancel(function() {console.log('callback called')})
        //this.collapsed = true
        this.translated = true
    }

    
    private listenForOfficials() {
        let self = this;
  
        let isBrowser = isPlatformBrowser(this.platformId)
        
        if(isBrowser) {
            this.official_selected_sub = this.roomService.official_selected.subscribe({
                next: function(official:Official) {
                    if(!self.room.officials) self.room.officials = []
                    self.room.officials.push(official)
                    self.roomService.setOfficials(self.room)
                    //console.log('self.room.officials = ', self.room.officials)
                    // now close the search-officials.component.ts slide up footer
                    self.translated = false
                },
                error: function(value) {
                },
                complete: function() {
                }
            }); 


            this.official_deleted_sub = this.roomService.official_deleted.subscribe({
                next: function(official:Official) {
                    _.remove(self.room.officials, (off:Official) => {
                        return off.name === official.name
                    })
                    self.roomService.setOfficials(self.room)
                    //console.log('self.room.officials = ', self.room.officials)
                },
                error: function(value) {
                },
                complete: function() {
                }
            })
        }
    }


}
