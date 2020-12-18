import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from 'src/app/user/user.service';
import { Subscription } from 'rxjs';
import { map/*, take*/ } from 'rxjs/operators';
import * as _ from 'lodash'
import { Friend } from '../friend.model';


@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {

    friends: Friend[]//{friendId1: string, displayName1: string, phoneNumber1: string, friendId2: string, displayName2: string, phoneNumber2: string, date_ms: number}[]
    raw: any[]
    private friendSubscription: Subscription;

    constructor(private userService: UserService,     
               @Inject(PLATFORM_ID) private platformId,) { this.raw = [] }

    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
            let me = await this.userService.getCurrentUser()
            this.friendSubscription = this.userService.getFriends(me).pipe(
              map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as Friend // {friendId1: string, displayName1: string, phoneNumber1: string, friendId2: string, displayName2: string, phoneNumber2: string, date_ms: number};
                  const id = a.payload.doc['id'];
                  var returnThis = { id, ...data };
                  // console.log('returnThis = ', returnThis);
                  return returnThis;
                });
              })
            )
            .subscribe(objs => {
                // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
                this.friends = _.map(objs, obj => {
                  let tm = obj as unknown;
                  return tm as Friend // {friendId1: string, displayName1: string, phoneNumber1: string, friendId2: string, displayName2: string, phoneNumber2: string, date_ms: number};
                });
            });
            // this.friendSubscription = this.userService.getFriends(me).subscribe(objs /*array*/ => {
            //     _.each(objs, obj => {
            //         console.log('friend-list: '+obj.type+': obj = ', obj.payload.doc.data().displayName2)
            //         let displayName1 = obj.payload.doc.data().displayName1
            //         let phoneNumber1 = obj.payload.doc.data().phoneNumber1
            //         let displayName2 = obj.payload.doc.data().displayName2
            //         let phoneNumber2 = obj.payload.doc.data().phoneNumber2
            //         let date_ms = obj.payload.doc.data().date_ms
            //         let thing = {type:obj.type, displayName1:displayName1, phoneNumber1:phoneNumber1, displayName2:displayName2, phoneNumber2:phoneNumber2, date_ms:date_ms}
            //         this.raw.push(thing)
            //     })  

            // })
              
        }
    }

    async ngOnDestroy() {
        if(this.friendSubscription) this.friendSubscription.unsubscribe()
    }


    async deleteFriend(friend: Friend) {
        this.userService.deleteFriend(friend)
    }


}
