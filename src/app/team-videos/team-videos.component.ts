import { Component, OnInit, OnDestroy, Input, Inject, PLATFORM_ID } from '@angular/core';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { Team } from '../team/team.model';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { RoomService } from '../room/room.service';
import { map } from 'rxjs/operators';
import { RoomObj } from '../room/room-obj.model';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-team-videos',
  templateUrl: './team-videos.component.html',
  styleUrls: ['./team-videos.component.css']
})
export class TeamVideosComponent implements OnInit {

    @Input() team: Team;
    roomSubscription: Subscription
    rooms: RoomObj[]
    isAdmin = false

    constructor(private roomService: RoomService,
      private userService: UserService,
      @Inject(PLATFORM_ID) private platformId,) { }

    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
           if(!this.team) return 
           if(!this.team.id) return 

           let user = await this.userService.getCurrentUser()
           this.isAdmin = user.isAdmin()
           
           this.roomSubscription = this.roomService.getRoomsForTeam(this.team).pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data() as RoomObj;
                // const id = a.payload.doc['id'];
                // var returnThis = { id, ...data };
                return data;
              });
            })
          )
            .subscribe(objs => {
              this.rooms = objs
              console.log('this.rooms = ', this.rooms)
            });

        }
    }


    ngOnDestroy() {
        if(this.roomSubscription) this.roomSubscription.unsubscribe()
    }

}
