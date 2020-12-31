import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Comment } from './comment.model';


/**
 * ng g s comments/comments
 */
@Injectable({
  providedIn: 'root'
})
export class CommentsService {

    constructor(
      private afs: AngularFirestore,) { }

    
    subscribeComments(roomSid: string, limit: number) {
        this.afs.collection('comment', ref => ref.where('RoomSid', '==', roomSid).orderBy('date_ms', 'asc').limit(limit))

        // ex:  ref = ref.orderBy('date_ms', this.reverse ? 'desc' : 'asc').startAt(this.dates.date2).endAt(this.dates.date1);
    }


    /*needed?  async*/ create(comment: Comment) {
        /*await*/ this.afs.collection('comment').doc(comment.commentId).set(comment)
    }


    createId() {
        return this.afs.createId()
    }
}
