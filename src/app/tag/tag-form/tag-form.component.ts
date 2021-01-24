import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../../user/user.service';
import { TagService } from '../tag.service';
import { Tag } from '../tag.model';



/**
 * ng g c tag/tag-form --module app
 * 
 * see also  comment-form.component.ts
 */
@Component({
  selector: 'app-tag-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.css']
})
export class TagFormComponent implements OnInit {

  // me: FirebaseUserModel
  // @Input() inputRoomToCommentForm: RoomObj      
  // @Output()  outputSavedComment = new EventEmitter<Comment>();
  // @Output()  outputDeletedComment = new EventEmitter<Comment>();
  tag?: Tag  
  // isLoggedIn: boolean
  tagForm: FormGroup
  confirmDelete = false
  canEdit = true
  canDelete = false

  

  tagFC = new FormControl('', [Validators.required])

  // https://headsupvideo.atlassian.net/browse/HEADSUP-34 
  onCommentChange() {
      console.log(this.tagForm.get('tagFC').value);
  }

  constructor(private userService: UserService,
              private tagService: TagService) { }

  async ngOnInit() {
      console.log('ngOnInit()')
      // this.me = await this.userService.getCurrentUser()
      // if(this.me) this.isLoggedIn = true
      // else this.isLoggedIn = false
      this.tagForm = new FormGroup({
         tagFC: this.tagFC,
      });
  }


  async onSubmit(/*form: NgForm*/) { 
      let inserting = false
      let theTag
      if(this.tag) {
          theTag = this.tag
          theTag.name = this.tagForm.get('tagFC').value
          theTag.name_lowerCase = theTag.name.toLowerCase()
          // are we about to overwrite the 'count' value ?
      }
      else {         
          inserting = true  
          let name = this.tagForm.get('tagFC').value
          theTag = {
              name: name,
              name_lowerCase: name.toLowerCase(),
              count: 0
          }
      }
      
      if(inserting)
          this.tagService.create(theTag)
      else this.tagService.update(theTag)
      this.tagForm.reset()
  }


  // setComment(comment: Comment, canEdit: boolean, canDelete: boolean) {
  //     this.comment = comment
  //     this.canDelete = canDelete
  //     this.canEdit = canEdit
  //     console.log('setComment(): canDelete = ', canDelete)
  //     this.commentForm.get('commentFC').setValue(comment.comment)
  // }


  deleteTag(tag: Tag) {
      this.tagService.delete(tag)
      this.tagForm.reset()
      this.confirmDelete = false
  }

}
