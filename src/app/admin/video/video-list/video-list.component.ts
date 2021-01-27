import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { RoomService } from '../../../room/room.service';
import { UserService } from '../../../user/user.service';
import { RoomObj } from '../../../room/room-obj.model';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Settings } from '../../../settings/settings.model';
import { SettingsService } from '../../../settings/settings.service';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as _ from 'lodash'
import { ActivatedRoute } from '@angular/router';



/**
 * ng g c admin/video/video-list
 */
@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.css']
})
export class VideoListComponent implements OnInit {

    rooms: RoomObj[]
    settingsDoc: Settings
    private roomSubscription: Subscription;
    response: string  // whatever each action returns


    constructor(private roomService: RoomService,
                private settingsService: SettingsService,
                private route: ActivatedRoute,
                @Inject(PLATFORM_ID) private platformId,
                private http: HttpClient,
                private userService: UserService) { }

    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
            // this.rooms = await this.roomService.getRooms()
            this.settingsDoc = await this.settingsService.getSettingsDoc()

            let parms = {limit: 25}   
            this.roomSubscription = this.roomService.getRooms(parms)
            .pipe(
                map(actions => {
                    return actions.map(a => {
                      const data = a.payload.doc.data() as RoomObj;
                      const id = a.payload.doc['id']
                      var returnThis = { id, ...data };
                      // console.log('returnThis = ', returnThis);
                      return returnThis;
                    });
                })
            )
            .subscribe(objs => {
                // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
                this.rooms = _.map(objs, obj => {
                    let rm = obj as unknown;
                    return rm as RoomObj;
                })
            });
        }
    }

    ngOnDestroy() {
        if(this.roomSubscription) this.roomSubscription.unsubscribe()
    }


    /**
     * Won't know CompositionSid - will have to look it up first - something we don't do anywhere else
     * see:  https://www.twilio.com/docs/video/api/compositions-resource?code-sample=code-list-all-compositions-for-a-room-sid-16&code-language=PHP&code-sdk-version=5.x
     

     curl -X GET https://video.twilio.com/v1/Compositions?RoomSid=RMXXXX \
     -u 'SKXXXX:your_api_key_secret'
 
     SAMPLE OUTPUT:
     (note, you can have multiple compositions for a single RoomSid.  If that ever happens, we probably want the most recent Composition)

     {
      "meta": {
        "page": 0,
        "page_size": 50,
        "first_page_url": "https://video.twilio.com/v1/Compositions?RoomSid=RM2588d2040804aa8cc5bbfaec87035341&PageSize=50&Page=0",
        "previous_page_url": null,
        "url": "https://video.twilio.com/v1/Compositions?RoomSid=RM2588d2040804aa8cc5bbfaec87035341&PageSize=50&Page=0",
        "next_page_url": null,
        "key": "compositions"
      },
      "compositions": [
        {
          "status": "completed",
          "trim": true,
          "video_layout": {
            "grid": {
              "z_pos": 0,
              "reuse": "show_oldest",
              "x_pos": 0,
              "max_columns": null,
              "cells_excluded": [],
              "video_sources_excluded": [],
              "height": null,
              "width": null,
              "max_rows": 1,
              "y_pos": 0,
              "video_sources": [
                "*"
              ]
            }
          },
          "date_completed": "2020-12-01T02:07:01Z",
          "format": "mp4",
          "url": "https://video.twilio.com/v1/Compositions/CJaab950514e7fea307d61c0c718dc4630",
          "bitrate": 841,
          "date_deleted": null,
          "account_sid": "ACce7e5e5cbf309ac4eb81b6579793a1b1",
          "duration": 38,
          "audio_sources": [
            "*"
          ],
          "sid": "CJaab950514e7fea307d61c0c718dc4630",
          "room_sid": "RM2588d2040804aa8cc5bbfaec87035341",
          "date_created": "2020-12-01T02:02:58Z",
          "size": 3964300,
          "resolution": "1280x720",
          "audio_sources_excluded": [],
          "links": {
            "media": "https://video.twilio.com/v1/Compositions/CJaab950514e7fea307d61c0c718dc4630/Media"
          }
        }
      ]
    }


     */
    async getCompositionSid(room) {
      
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
              'Access-Control-Allow-Origin': '*'
            }),
            //params: new HttpParams().set('uid', uid)
        };

        // twilio-video.js
        let getCompositionSidUrl = `https://${this.settingsDoc.firebase_functions_host}/getCompositionSid?RoomSid=${room.RoomSid}`
        console.log(getCompositionSidUrl)
        let data:any = await this.http.get(getCompositionSidUrl, httpOptions).toPromise()
        this.response = `Found CompositionSid: ${data.CompositionSid} and ${data.compositions.length} composition(s) in all`
    }


    /**
     * stop: true/false - do we stop (true) after just the download, or do we keep going (false) all the way through to the completion of the video's production/upload
     */
    async downloadComposition(room, stop) {
              
        const downloadOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
              'Access-Control-Allow-Origin': '*'
            }),
            params: new HttpParams().set('cloud_host', this.settingsDoc.cloud_host)
                                    .set('stop', stop)
                                    .set('RoomSid', room.RoomSid)
                                    .set('MediaUri', `/v1/Compositions/${room.CompositionSid}/Media`)
                                    .set('CompositionSid', room.CompositionSid)
                                    .set('firebase_functions_host', this.settingsDoc.firebase_functions_host)
                                    .set('website_domain_name', this.settingsDoc.website_domain_name)
        };

        /**
         * downloadComposition() set CompositionSid on the room object in 
         */
        let downloadCompositionUrl = `http://${this.settingsDoc.firebase_functions_host}/downloadComposition`
        this.http.get(downloadCompositionUrl, downloadOptions).toPromise()
        // from yourvotecounts: index.js: /downloadComposition
        .then(data => this.response = `success - data = ${JSON.stringify(data)}`)
        .catch(error => this.response = `Error: ${JSON.stringify(error)}`)
        // console.log('getCompositionSid():  data2 = ', data2)
        
    }


    async cutVideo(room) {
        const options = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
              'Access-Control-Allow-Origin': '*'
            }),
            params: new HttpParams().set('compositionFile', `/home/bdunklau/videos/${room.CompositionSid}.mp4`)
                                    .set('CompositionSid', room.CompositionSid)
                                    .set('RoomSid', room.RoomSid)
                                    .set('tempEditFolder', `/home/bdunklau/videos/${room.CompositionSid}`)
                                    .set('website_domain_name', this.settingsDoc.website_domain_name)
        };


        let url = `http://${this.settingsDoc.firebase_functions_host}/cutVideo`
        // this.http.post(url, formData, options).subscribe(
        //     (resp) => this.response = `sliced and diced `,
        //     (error) => this.response = `Error: ${JSON.stringify(error)}`
        // )
        this.http.get(url, options).toPromise()
        // from yourvotecounts: index.js: /cutVideo
        .then(data => this.response = `success - data = ${JSON.stringify(data)}`)
        .catch(error => this.response = `Error: ${JSON.stringify(error)}`)

    }


      async createHls(room) {

        /**
        * req.query needed:  cloud_host, CompositionSid, RoomSid, phones, firebase_functions_host, 
        * compositionProgress, website_domain_name, projectId, storage_keyfile
        */
        const options = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
              'Access-Control-Allow-Origin': '*'
            }),
            params: new HttpParams().set('cloud_host', this.settingsDoc.cloud_host)
                                    .set('CompositionSid', room.CompositionSid)
                                    .set('RoomSid', room.RoomSid)
                                    .set('phones', this.settingsDoc.to_sms)
                                    .set('firebase_functions_host', this.settingsDoc.firebase_functions_host)
                                    .set('compositionProgress', room.compositionProgress)
                                    .set('website_domain_name', this.settingsDoc.website_domain_name)
                                    .set('projectId', this.settingsDoc.projectId)
                                    .set('storage_keyfile', this.settingsDoc.storage_keyfile)
        };


        let url = `http://${this.settingsDoc.firebase_functions_host}/createHls`
        this.http.get(url, options).toPromise()
        .then(data => this.response = `success - data = ${JSON.stringify(data)}`)
        .catch(error => this.response = `Error: ${JSON.stringify(error)}`)
    }
 

    /**
     * Don't do it this way - getting Cross Origin Read Block CORB
     * Try a db trigger instead that makes the http call to the vm
     * 
     */
    async uploadToFirebaseStorage(room) {

        this.roomService.uploadToFirebaseStorage(room)
    }


    async uploadScreenshotToStorage(room) {
        this.roomService.uploadScreenshotToStorage(room)
    }


    async deleteVideo(room) {
        this.roomService.deleteVideo(room)
    }

    async deleteCompositionSid(room) {
        this.roomService.deleteCompositionSid(room)
    }

    async deleteCompositionFile(room) {
        this.roomService.deleteCompositionFile(room)
    }

    async deleteOutputFile(room) {
        this.roomService.deleteOutputFile(room)
    }

    async deleteHlsFiles(room) {
        this.roomService.deleteHlsFiles(room)
    }

    async deleteStorageItems(room) {
        this.roomService.deleteStorageItems(room)
    }

    async deleteScreenshotUrl(room) {
        this.roomService.deleteScreenshotUrl(room)
    }

    async recreateVideo(room) {
        await this.roomService.deleteVideoResults(room)
        await this.roomService.triggerRecreateVideo(room)     
    }


}
