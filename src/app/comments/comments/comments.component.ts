import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { RoomObj } from '../../room/room-obj.model';
import { Comment } from '../comment.model';
import { CommentFormComponent } from '../comment-form/comment-form.component';
import { UserService } from 'src/app/user/user.service';
import { FirebaseUserModel } from 'src/app/user/user.model';



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
    me: FirebaseUserModel

    //  notice #editCommentFormDirective on comments.component.html
    @ViewChild('editCommentFormDirective')  editCommentForm: CommentFormComponent;

    constructor(private userService: UserService) { }

    async ngOnInit() {
        this.me = await this.userService.getCurrentUser()
    }

    onSelectedComment(comment: Comment) {
        this.editFormTranslated = true
        let imAuthor = this.me && this.me.uid === comment.authorId
        let imAdmin = this.me && this.me.isAdmin()
        let canEdit = imAuthor
        let canDelete = imAuthor || imAdmin
        this.editCommentForm.setComment(comment, canEdit, canDelete)
    }

    onSavedComment(comment: Comment) {
        this.editFormTranslated = false
        this.editFormCollapsed = true
    }

    onDeletedComment(comment: Comment) {
        this.editFormTranslated = false
        this.editFormCollapsed = true
    }

}
