import { Component, OnInit, OnDestroy, Input, Inject, PLATFORM_ID } from '@angular/core';
import { CommentsService } from '../comments.service';
import { RoomObj } from 'src/app/room/room-obj.model';
import { Comment } from '../comment.model';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import * as _ from 'lodash'


/**
 * ng g c comments/comment-list --module=app
 */
@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit {

    @Input() inputRoomToCommentList: RoomObj
    comments: Comment[]
    subscription: Subscription

    constructor(private commentsService: CommentsService,
      @Inject(PLATFORM_ID) private platformId,) { }

    ngOnInit() {

        if(isPlatformBrowser(this.platformId)) {

            this.comments = [];
            
            // query team_member where userId = user.uid
            let args = {room: this.inputRoomToCommentList /*, limit: limit */}
            this.subscription = this.commentsService.getComments(args).pipe(
              map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as Comment;
                  const id = a.payload.doc['id'];
                  var returnThis = { id, ...data };
                  // console.log('returnThis = ', returnThis);
                  return returnThis;
                });
              })
            )
              .subscribe(objs => {
                this.comments = _.map(objs, obj => {
                  let tm = obj as unknown;
                  return tm as Comment;
                })
              });



        }

    }





    ngOnDestroy() {
        if(this.subscription) this.subscription.unsubscribe()
    }

}
