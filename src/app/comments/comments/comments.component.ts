import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { RoomObj } from '../../room/room-obj.model';
import { Comment } from '../comment.model';
import { CommentFormComponent } from '../comment-form/comment-form.component';



/**
 * ng g c comments/comments --module app
 */
@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

    @Input() inputRoomToComments: RoomObj
    editFormCollapsed = false
    editFormTranslated = false

    //  notice #editCommentFormDirective on comments.component.html
    @ViewChild('editCommentFormDirective')  editCommentForm: CommentFormComponent;

    constructor() { }

    ngOnInit() {
    }

    onSelectedComment(comment: Comment) {
        this.editFormTranslated = true
        this.editCommentForm.setComment(comment)
    }

    onSavedComment(comment: Comment) {
        this.editFormTranslated = false
        this.editFormCollapsed = true
    }

}
