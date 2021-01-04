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

    
    getComments(args: any) {
        let roomSid = args.room.RoomSid
        // let query = ref => ref.where('RoomSid', '==', roomSid).orderBy('date_ms', 'asc')
        // if(args.limit) query = ref => ref.where('RoomSid', '==', roomSid).orderBy('date_ms', 'asc').limit(args.limit)
        let query = ref => ref.orderBy('date_ms', 'asc')
        return this.afs.collection('room').doc(roomSid).collection('comments', query).snapshotChanges()

        // ex from logs:  ref = ref.orderBy('date_ms', this.reverse ? 'desc' : 'asc').startAt(this.dates.date2).endAt(this.dates.date1);
    }


    /*needed?  async*/ create(comment: Comment) {
        /*await*/ this.afs.collection('room').doc(comment.RoomSid).collection('comments').doc(comment.commentId).set(comment)
    }


    update(comment: Comment) {
        console.log('update(): comment = ', comment)
        this.afs.collection('room').doc(comment.RoomSid).collection('comments').doc(comment.commentId).update(comment)
    }


    delete(comment: Comment) {
        this.afs.collection('room').doc(comment.RoomSid).collection('comments').doc(comment.commentId).delete()
    }


    createId() {
        return this.afs.createId()
    }
}