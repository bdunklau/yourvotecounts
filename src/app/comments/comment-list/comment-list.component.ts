import { Component, OnInit, OnDestroy, Input, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommentsService } from '../comments.service';
import { Comment } from '../comment.model';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import * as _ from 'lodash'
import { RoomObj } from '../../room/room-obj.model';
import { UserService } from 'src/app/user/user.service';
import { FirebaseUserModel } from 'src/app/user/user.model';


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
    @Output() outputSelectedComment = new EventEmitter<Comment>();
    me: FirebaseUserModel

    constructor(private commentsService: CommentsService,
      private userService: UserService,
      @Inject(PLATFORM_ID) private platformId,) { }

    async ngOnInit() {

        if(isPlatformBrowser(this.platformId)) {
            this.me = await this.userService.getCurrentUser()

            this.comments = [];
            
            // query team_member where userId = user.uid
            let args = {room: this.inputRoomToCommentList /*, limit: limit */}
            this.subscription = this.commentsService.getComments(args).pipe(
              map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as Comment;
                  /**
                   * You CAN do this to get the doc id, but we have the commentId attribute on the document already which 
                   * equals the doc id
                   */
                  // const id = a.payload.doc['id'];
                  // var returnThis = { id, ...data };
                  return data //returnThis;
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


    selectComment(comment: Comment) {
        if(this.me && this.me.uid === comment.authorId)
            this.outputSelectedComment.emit(comment)
    }

}
