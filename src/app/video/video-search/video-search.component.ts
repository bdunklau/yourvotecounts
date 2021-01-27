import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RoomObj } from '../../room/room-obj.model';
import { Settings } from '../../settings/settings.model';
import { Subscription } from 'rxjs';
import { RoomService } from 'src/app/room/room.service';
import { SettingsService } from 'src/app/settings/settings.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/user/user.service';
import { isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/operators';
import * as _ from 'lodash'


/**
 * ng g c video/video-search --module app
 * 
 * This is the .ts file from admin/video-list combined with an adapted version of video/my-videos.component.html
 */
@Component({
  selector: 'app-video-search',
  templateUrl: './video-search.component.html',
  styleUrls: ['./video-search.component.css']
})
export class VideoSearchComponent implements OnInit {

    
    rooms: RoomObj[]
    settingsDoc: Settings
    private roomSubscription: Subscription;
    response: string  // whatever each action returns
    tagName: string


    constructor(private roomService: RoomService,
                private settingsService: SettingsService,
                private route: ActivatedRoute,
                @Inject(PLATFORM_ID) private platformId,
                private http: HttpClient,
                private userService: UserService) { }

    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
            // this.rooms = await this.roomService.getRooms()
            this.settingsDoc = await this.settingsService.getSettingsDoc()

            this.route.params.subscribe(params => {
                this.paramsChange(params.tagName);
            });

        }
    }

    ngOnDestroy() {
        if(this.roomSubscription) this.roomSubscription.unsubscribe()
    }


    paramsChange(tagName) {
        
        let parms = {limit: 25}            
        this.tagName = tagName
        console.log('ngOnInit():  this.route.snapshot.params.tagName = ', this.route.snapshot.params.tagName)
        if(this.tagName) {
            parms['tagName'] = this.tagName
        }
        this.roomSubscription = this.roomService.getRooms(parms)
        .pipe(
            map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as RoomObj;
                  const id = a.payload.doc['id']
                  var returnThis = { id, ...data };
                  // console.log('returnThis = ', returnThis);
                  return returnThis;
                });
            })
        )
        .subscribe(objs => {
            // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
            this.rooms = _.map(objs, obj => {
                let rm = obj as unknown;
                return rm as RoomObj;
            })
        });
    }

}
