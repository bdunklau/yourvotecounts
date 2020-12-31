import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from 'src/app/user/user.service';
import { CommentsService } from '../comments.service';
import { FirebaseUserModel } from 'src/app/user/user.model';
import { RoomObj } from 'src/app/room/room-obj.model';
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
    isLoggedIn: boolean


    commentForm = new FormGroup({
       comment: new FormControl('', [Validators.required]),
    });


    constructor(private userService: UserService,
                private commentsService: CommentsService) { }

    async ngOnInit() {
        this.me = await this.userService.getCurrentUser()
        if(this.me) this.isLoggedIn = true
        else this.isLoggedIn = false
    }


    async onSubmit(/*form: NgForm*/) { 
      
        let comment = {
            author: this.me.displayName,
            authorId: this.me.uid,
            commentId: this.commentsService.createId(), // the doc id
            comment: this.commentForm.get('comment').value,
            date: new Date(),
            date_ms: new Date().getTime(),
            RoomSid: this.inputRoomToCommentForm.RoomSid
        } as Comment
        
        if(this.inputRoomToCommentForm.CompositionSid) comment.CompositionSid = this.inputRoomToCommentForm.CompositionSid
        this.commentsService.create(comment)
        this.commentForm.reset()
    }

}
