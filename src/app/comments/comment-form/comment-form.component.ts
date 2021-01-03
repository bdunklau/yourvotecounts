import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from '../../user/user.service';
import { CommentsService } from '../comments.service';
import { FirebaseUserModel } from '../../user/user.model';
import { RoomObj } from '../../room/room-obj.model';
import { Comment } from '../comment.model';



/**
 * ng g c comments/comment-form --module=app
 */
@Component({
  selector: 'app-comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css']
})
export class CommentFormComponent implements OnInit {

    me: FirebaseUserModel
    @Input() inputRoomToCommentForm: RoomObj      
    @Output()  outputSavedComment = new EventEmitter<Comment>();
    @Output()  outputDeletedComment = new EventEmitter<Comment>();
    comment?: Comment  
    isLoggedIn: boolean
    commentForm: FormGroup
    confirmDelete = false
    canEdit = true
    canDelete = false


    constructor(private userService: UserService,
                private commentsService: CommentsService) { }

    async ngOnInit() {
        console.log('ngOnInit()')
        this.me = await this.userService.getCurrentUser()
        if(this.me) this.isLoggedIn = true
        else this.isLoggedIn = false
        this.commentForm = new FormGroup({
           comment: new FormControl('', [Validators.required]),
        });
    }


    async onSubmit(/*form: NgForm*/) { 
        let inserting = false
        let theComment
        if(this.comment) {
            theComment = this.comment
            theComment.comment = this.commentForm.get('comment').value
        }
        else {         
            inserting = true   
            theComment = {
                author: this.me.displayName,
                authorId: this.me.uid,
                commentId: this.commentsService.createId(), // the doc id
                comment: this.commentForm.get('comment').value,
                date: new Date(),
                date_ms: new Date().getTime(),
                RoomSid: this.inputRoomToCommentForm.RoomSid
            } as Comment

            if(this.inputRoomToCommentForm.CompositionSid) theComment.CompositionSid = this.inputRoomToCommentForm.CompositionSid
        }
        
        this.outputSavedComment.emit(theComment) // comments.component.ts onSavedComment() sees this and closed the slide-up comment form
        if(inserting)
            this.commentsService.create(theComment)
        else this.commentsService.update(theComment)
        this.commentForm.reset()
    }


    setComment(comment: Comment, canEdit: boolean, canDelete: boolean) {
        this.comment = comment
        this.canDelete = canDelete
        this.canEdit = canEdit
        console.log('setComment(): canDelete = ', canDelete)
        this.commentForm.get('comment').setValue(comment.comment)
    }


    deleteComment(comment: Comment) {
        this.outputDeletedComment.emit(comment)
        this.commentsService.delete(comment)
        this.commentForm.reset()
        this.confirmDelete = false
    }

}
