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
import { Router } from '@angular/router';


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
      private router: Router,
      @Inject(PLATFORM_ID) private platformId,) { }

    async ngOnInit() {

        if(isPlatformBrowser(this.platformId)) {
            this.me = await this.userService.getCurrentUser()

            this.comments = [];
            
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


    canEdit(comment: Comment) {
        let imAuthor = this.me && this.me.uid === comment.authorId
        let imAdmin = this.me && this.me.isAdmin()
        return imAuthor || imAdmin
    }


    selectComment(comment: Comment) {
        let imAuthor = this.me && this.me.uid === comment.authorId
        let imAdmin = this.me && this.me.isAdmin()
        if(imAuthor || imAdmin)
            this.outputSelectedComment.emit(comment)
    }

}
