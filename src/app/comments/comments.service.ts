import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Comment } from './comment.model';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../settings/settings.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';



/**
 * ng g s comments/comments
 */
@Injectable({
  providedIn: 'root'
})
export default class CommentsService {

    settings: Settings

    constructor(
      private settingsService: SettingsService,
      private http: HttpClient,
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


    async getLinkPreview(comment: string) {        
        if(!this.settings) {
            this.settings = await this.settingsService.getSettingsDoc()
        }

        const options = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
              'Access-Control-Allow-Origin': '*'
            })
            // params: new HttpParams().set('compositionFile', `/home/bdunklau/videos/${room.CompositionSid}.mp4`)
            //                         .set('CompositionSid', room.CompositionSid)
            //                         .set('RoomSid', room.RoomSid)
            //                         .set('tempEditFolder', `/home/bdunklau/videos/${room.CompositionSid}`)
            //                         .set('website_domain_name', this.settingsDoc.website_domain_name)
        };

        let formData = {
            comment: comment
        }


        let url = `https://${this.settings.firebase_functions_host}/linkPreview`
        // this.http.post(url, formData, options).subscribe(
        //     (resp) => console.log('POST success: ', resp),
        //     (error) => console.log('POST ERROR: ', error)
        // )

        let resp = await this.http.post(url, formData, options).toPromise()
        return resp




        // if(urls && urls.length > 0) {
        //     let linkPreviewJson:any = await this.http.get(`https://${this.settings.firebase_functions_host}/linkPreview?url${urls[0]}`).toPromise()
        //     return linkPreviewJson
        // }
    }
}
