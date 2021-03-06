import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { RoomObj } from './room-obj.model';
import { //connect,
          //Participant,
          //RemoteTrack,
          //RemoteAudioTrack,
          //RemoteVideoTrack,
          //RemoteParticipant,
          //RemoteTrackPublication,
          //ConnectOptions,
          //LocalTrack,
          //LocalVideoTrack,
          Room,
          //createLocalTracks 
        } from 'twilio-video';
import { Invitation } from '../invitation/invitation.model';
import { take } from 'rxjs/operators';
//import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Official } from '../civic/officials/view-official/view-official.component'
import { Observable } from 'rxjs'
import { AngularFireStorage } from '@angular/fire/storage';
import { SettingsService } from '../settings/settings.service';
import * as firebase from 'firebase/app';
import { HttpClient } from '@angular/common/http';
import { Settings } from '../settings/settings.model';
import { isPlatformBrowser } from '@angular/common';
import { TeamService } from '../team/team.service';
import { TeamMember } from '../team/team-member.model';
import { Team } from '../team/team.model';


@Injectable({
  providedIn: 'root'
})
export class RoomService {

  // hack for passing room from video-ready.guard to view-video.component
  roomObj: RoomObj
  isHost = false

  official_selected = new Subject<Official>()
  official_deleted = new Subject<Official>()
  settings: Settings

  constructor(
    private teamService: TeamService,
    private settingsService: SettingsService,
    @Inject(PLATFORM_ID) private platformId,
    private afs: AngularFirestore,
    private http:HttpClient,
    private afStorage: AngularFireStorage,) { 

        // causing unit tests to fail - why?
        // if(isPlatformBrowser(this.platformId)) {
        //     this.settingsService.getSettingsDoc().then(settings => {
        //         this.settings = settings
        //     })
        // }
  }


  async saveRoom(roomObj: any) {
    // How do we keep from overwriting data when the second person joins?
    // see video-call.component.ts:join_call()
    await this.afs.collection('room').doc(roomObj['RoomSid']).set(roomObj)
  }


  /**
   * 
   * @param rm the twilio room
   * @param invitation 
   * @param phoneNumber the phone of the current user - compare with the phone numbers in the invitation object to tell 
   * if this person is the host or a guest 
   */
  async createRoomObj(rm: Room, invitations: Invitation[], phoneNumber: string) {
    let roomObj = {        
        RoomSid: rm.sid,
        created_ms: new Date().getTime(),
        hostId: invitations[0].creatorId,  // all these [0] values are shared by all guests
        hostName: invitations[0].creatorName,
        hostPhone: invitations[0].creatorPhone,
        invitationId: invitations[0].invitationId,
        //guestsX: [
        //  { guestName: invitation.displayName, guestPhone: invitation.phoneNumber }
        //],
        guests: _.map(invitations, invitation => {return {guestName: invitation.displayName, guestPhone: invitation.phoneNumber}}),
        phones: _.map(invitations, invitation => {return invitation.phoneNumber}),
        recording_state: '',
        mark_time: [], // the start- and stop-recording times
    }

    // this will not work if the user belongs to more than one team !!!!
    // ref:  https://headsup-video.atlassian.net/wiki/spaces/HEADSUP/pages/104136705/Associate+Video+with+a+Team#What-if-a-user-belongs-to-more-than-one-team%3F
    let teamId = await this.getFirstTeam(invitations[0].creatorId)
    if(teamId) roomObj['teamDocId'] = teamId

    roomObj.phones.push(roomObj.hostPhone)
    let guest = _.find(roomObj['guests'], g => {
        return g['guestPhone'] === phoneNumber
    })
    if(guest) {
        guest['joined_ms'] = new Date().getTime()
        guest['participantSid'] = rm.localParticipant.sid
    }
    //if(phoneNumber === invitation.phoneNumber) roomObj['guests'][0]['joined_ms'] = new Date().getTime()
    else roomObj['host_joined_ms'] = new Date().getTime()
    
    return roomObj;
  }


  private async getFirstTeam(hostId: string) {
      let teamMemberships:TeamMember[] = await this.teamService.getTeamsForUser_snapshot(hostId)
      if(!teamMemberships || teamMemberships.length < 1) return 
      return teamMemberships[0].teamDocId
  }


  // the room already exists.  see video-call.component.ts:join_call()
  // the join time here is for someone OTHER than the first person to join.  The first person's join time is 
  // written when the room is created/connected to
  addJoinTime(roomObj: any, invitations: Invitation[], phoneNumber: string, participantSid: string) {
    let isHost = invitations[0].creatorPhone === phoneNumber;
    if(isHost) {
      roomObj['host_joined_ms'] = new Date().getTime()
      // roomObj['host_left_ms'] = null  // don't allow the host to hang up and re-join.  If the host leaves, the call is over
    }
    else {
      let guest = _.find(roomObj['guests'], obj => {
        return obj['guestPhone'] === phoneNumber
      })
      if(guest) {
        guest['joined_ms'] = new Date().getTime()
        guest['participantSid'] = participantSid
        delete guest['left_ms']// = null // allows guest to hang up and rejoin the call
      }
    }
    //return roomObj
  }

  

  /**
   * Figure out if we are saving a new room or updating an existing room
   * Figure out if the participant is the host or a guest and add/insert the appropriate "join" time (host or guest join time)
   * @param rm 
   * @param invitation 
   * @param phoneNumber 
   */
  async saveOnJoin(rm: Room, invitations: Invitation[], phoneNumber: string) {
    
    let roomDocs = this.afs.collection('room', ref => ref.where("RoomSid", "==", rm.sid)).snapshotChanges().pipe(take(1));
    
    roomDocs.subscribe(async data  => {
      let found = false
      let roomObj = {}
      data.forEach(function(roomDoc) {
          found = true
          console.log(' roomObj.payload.doc.data() = ', roomDoc.payload.doc.data()) 
          roomObj = roomDoc.payload.doc.data()
      });
      if(found) {
        // Since the room already exists, all we need to do is figure out if the user is the host or guest
        // and write the corresponding "join" time to the database
        this.addJoinTime(roomObj, invitations, phoneNumber, rm.localParticipant.sid)
      }
      else {
        roomObj = await this.createRoomObj(rm, invitations, phoneNumber);
      }
      
      this.saveRoom(roomObj);

    });


  }


  monitorRoom(roomSid: string) {
    var retThis = this.afs.collection('room', ref => ref.where("RoomSid", "==", roomSid)).snapshotChanges();
    return retThis;
  }


  monitorRoomByInvitationId(invitationId: string) {
    var retThis = this.afs.collection('room', ref => ref.where("invitationId", "==", invitationId)).snapshotChanges();
    return retThis;
  }


  async disconnect(roomObj: RoomObj, phoneNumber: string) {
    // is this the host phone or the guest phone?
    let isHost = roomObj.hostPhone === phoneNumber;
    if(isHost) {
      await this.disconnectEveryone(roomObj, phoneNumber)
    }
    else {     
      await this.disconnectGuest(roomObj, phoneNumber)
    }
    
  }


  /**
   * If the host is disconnecting, then all other participants should be disconnected also
   * and the call is over.
   */
  private async disconnectEveryone(roomObj: RoomObj, phoneNumber: string) {
    roomObj['host_left_ms'] = new Date().getTime()
    _.each(roomObj['guests'], guest => {
      guest['left_ms'] = new Date().getTime()
    })
    roomObj['call_ended_ms'] = new Date().getTime()
    await this.saveRoom(roomObj);
  }


  private async disconnectGuest(roomObj: RoomObj, phoneNumber: string) {
    let guest = _.find(roomObj['guests'], obj => {
      return obj['guestPhone'] === phoneNumber
    })
    guest['left_ms'] = new Date().getTime()
    await this.saveRoom(roomObj);
    
  }


  /**
   * Get the room doc having the invitationId.  There should be only one.
   * @param invitationId 
   */
  getRoom(invitationId: string) {
    return this.afs.collection('room', ref => ref.where("invitationId", "==", invitationId).limit(1)).snapshotChanges().pipe(take(1))
  }


  getRoomData(compositionSid: string): Observable<any> {
    let ret = this.afs.collection('room', ref => ref.where("CompositionSid", "==", compositionSid).limit(1)).snapshotChanges().pipe(take(1))
    return ret
    
  }


  async getRoomByRoomSid(roomSid: string): Promise<RoomObj> {
      var roomDoc = await this.afs.collection('room').doc(roomSid).ref.get();
      return roomDoc.data() as RoomObj
  }


  /**
   * Sets the 'recording_state' attribute on the Room doc so that all connected clients
   * know whether recording is on/off/paused
   * @see video-call.component.ts:monitorRoom()
   * @param state
   */
  setRecordingState(roomObj: RoomObj) {
    this.afs.collection('room').doc(roomObj['RoomSid']).update({recording_state: roomObj['recording_state'], mark_time: roomObj['mark_time']})
  }


  saveVideoTitle(roomSid: string, video_title: string) {
      this.afs.collection('room').doc(roomSid).update({video_title: video_title})
  }


  saveVideoDescription(roomSid: string, video_description: string) {
      this.afs.collection('room').doc(roomSid).update({video_description: video_description})
  }


  setOfficials(room: RoomObj) {
      this.afs.collection('room').doc(room.RoomSid).update({officials: room.officials})
  }


  /**
   * view-official.component.ts calls this - passes the selected officials here
   * view-video.component.ts picks up these officials in listenForOfficials()
   * @param officials 
   */
  officialSelected(official: Official) {
      this.official_selected.next(official);
  }

  officialDeleted(official: Official) {
      this.official_deleted.next(official)
  }


  async getVideos(phoneNumber: string) {      

      let observable = this.afs.collection('room', ref => ref.where('phones', 'array-contains', phoneNumber).orderBy('created_ms', 'desc')).snapshotChanges().pipe(take(1));
      
      let docChangeActions = await observable.toPromise()
      console.log('getVideos: docChangeActions = ', docChangeActions)
      var rooms: RoomObj[] = []
      if(docChangeActions && docChangeActions.length > 0) {
          _.each(docChangeActions, obj => {
              let data = obj.payload.doc.data()
              let docId = obj.payload.doc['id']
              let room = data as RoomObj
              if(room.CompositionSid)
                  rooms.push(room)
              // console.log('getVideos(): ',docId, ':  ', data)
          })
      }
      return rooms

  }


  /**
   * For admins to review rooms/videos  (admin/video/video-list)
   */
  getRooms(parms: any) {
      let limit = parms.limit ? parms.limit : 25
      let query;
      if(parms.tagName) query = ref => ref.where('tags', 'array-contains', parms.tagName ).orderBy('created_ms', 'desc').limit(limit)
      else  query = ref => ref.orderBy('created_ms', 'desc').limit(limit)
      let observable = this.afs.collection('room', query).snapshotChanges()//.pipe(take(1));
      return observable
      
      // let docChangeActions = await observable.toPromise()
      // var rooms: RoomObj[] = []
      // if(docChangeActions && docChangeActions.length > 0) {
      //     _.each(docChangeActions, obj => {
      //         let data = obj.payload.doc.data()
      //         let docId = obj.payload.doc['id']
      //         rooms.push(data as RoomObj)
      //         // console.log('getRooms(): ',docId, ':  ', data)
      //     })
      // }
      // console.log('getRooms(): rooms = ', rooms)
      // return rooms      
  }


  getRoomsForTeam(team: Team) {
    let observable = this.afs.collection('room', ref => ref.where('teamDocId', '==', team.id).orderBy('created_ms', 'desc')).snapshotChanges() // works

    // TODO come back to this
    // console.log('getRoomsForTeam')
    // let observable = this.afs.collection('room', ref => ref.where('teamDocId', '==', team.id).where('CompositionSid', '!=', false).orderBy('CompositionSid', 'asc').orderBy('created_ms', 'desc')).snapshotChanges()
    return observable
  }


  /**
   *  delete the room doc and the folder in storage having the name [CompositionSid]
   */
  async deleteRoom(room: RoomObj) {

      let settings = await this.settingsService.getSettingsDoc()

      let folderPath = `gs://${settings.projectId}.appspot.com/${room.CompositionSid}`

      /**
       * folder is deleted whenn all of its contents are deleted
       */
      this.afStorage.storage.refFromURL(folderPath).listAll().then(data => {
          data.items.forEach(item => {
            this.afStorage.storage.ref(item['location']['path']).delete()
            console.log('CHECK: item[\'location\'][\'path\'] = ', item['location']['path'])
          });
      })
      .then(() => {
          return this.afs.collection('room').doc(room.RoomSid).delete()
      })
  }


  /**
   * https://headsupvideo.atlassian.net/browse/HEADSUP-106
   */
  async setCallEnded(roomObj: RoomObj) {
      let call_ended_ms = new Date().getTime()
      await this.afs.collection('room').doc(roomObj.RoomSid).update({call_ended_ms: call_ended_ms})
      roomObj.call_ended_ms = call_ended_ms
  }


  /**
   * for admins
   * video-list.component.ts
   */
  async uploadToFirebaseStorage(room) {
      await this.afs.collection('upload_requests').doc(room.RoomSid).delete()
      await this.afs.collection('upload_requests').doc(room.RoomSid).set(room)
  }


  async uploadScreenshotToStorage(room) {
      await this.afs.collection('upload_screenshot_requests').doc(room.RoomSid).delete()
      await this.afs.collection('upload_screenshot_requests').doc(room.RoomSid).set(room)
  }


  async deleteVideo(room) {
      await this.afs.collection('delete_video_requests').doc(room.RoomSid).delete()
      await this.afs.collection('delete_video_requests').doc(room.RoomSid).set(room)
  }

  async deleteCompositionSid(room) {
      await this.afs.collection('room').doc(room.RoomSid).update({CompositionSid: firebase.firestore.FieldValue.delete()})
  }

  async deleteCompositionFile(room) {
      await this.afs.collection('room').doc(room.RoomSid).update({compositionFile: firebase.firestore.FieldValue.delete()})
  }

  async deleteOutputFile(room) {
      await this.afs.collection('room').doc(room.RoomSid).update({outputFile: firebase.firestore.FieldValue.delete()})
  }

  async deleteHlsFiles(room) {
      await this.afs.collection('room').doc(room.RoomSid).update({uploadFiles: firebase.firestore.FieldValue.delete()})
  }

  async deleteStorageItems(room) {
      await this.afs.collection('room').doc(room.RoomSid).update({storageItems: firebase.firestore.FieldValue.delete()})
  }

  async deleteScreenshotUrl(room) {
      await this.afs.collection('room').doc(room.RoomSid).update({screenshotUrl: firebase.firestore.FieldValue.delete()})
  }

  async deleteVideoResults(room) {
      await this.afs.collection('room').doc(room.RoomSid)
                      .update({
                          compositionFile: firebase.firestore.FieldValue.delete(),
                          compositionProgress: firebase.firestore.FieldValue.delete(),
                          outputFile: firebase.firestore.FieldValue.delete(),
                          uploadFiles: firebase.firestore.FieldValue.delete(),
                          storageItems: firebase.firestore.FieldValue.delete(),
                          screenshotUrl: firebase.firestore.FieldValue.delete(),
                          tempEditFolder: firebase.firestore.FieldValue.delete(),
                          videoUrl: firebase.firestore.FieldValue.delete(),
                          videoUrlAlt: firebase.firestore.FieldValue.delete()
                      })
  }

  async triggerRecreateVideo(room) {    
      await this.afs.collection('recreate_video_requests').doc(room.RoomSid).delete()
      await this.afs.collection('recreate_video_requests').doc(room.RoomSid).set(room)
  }


  async viewed(room: RoomObj) {
      // legacy check
      console.log(`room.views -> `, room.views)
      if(!room.views) {
          await this.afs.collection('room').doc(room.RoomSid).update({views: 0})
      }
      let ipAddress = await this.getIp()
      let xxx = await this.afs.collection('room').doc(room.RoomSid).collection('visits').doc(ipAddress).ref.get()
      // data undefined if ip address not found
      let data = xxx.data()
      if(!data) {
          let batch = this.afs.firestore.batch();
          batch.update(this.afs.collection('room').doc(room.RoomSid).ref, {views: firebase.firestore.FieldValue.increment(1)});
          batch.set(this.afs.collection('room').doc(room.RoomSid).collection('visits').doc(ipAddress).ref, {ipAddress: ipAddress})
          await batch.commit();
      }
      console.log(`get ${ipAddress} -> `, data)
  }


  private async getIp() {
    if(!this.settings) {
        this.settings = await this.settingsService.getSettingsDoc()
    }
    let resp:any = await this.http.get(`https://${this.settings.firebase_functions_host}/getIp`).toPromise()
    return resp.ip
  }


  async addTag(room:RoomObj, tagName: string) {
      let batch = this.afs.firestore.batch();
      if(!room.tags) room.tags = []
      room.tags.push(tagName)
      batch.update(this.afs.collection('room').doc(room.RoomSid).ref, {tags: room.tags})
      batch.update(this.afs.collection('tag').doc(tagName).ref, {count: firebase.firestore.FieldValue.increment(1)})
      await batch.commit()
  }


  async removeTag(room:RoomObj, tagName: string) {
      let batch = this.afs.firestore.batch();
      let before = room.tags.length
      _.remove(room.tags, aTagName => { return aTagName == tagName })
      let after = room.tags.length
      if(before == after) return
      batch.update(this.afs.collection('room').doc(room.RoomSid).ref, {tags: room.tags})
      batch.update(this.afs.collection('tag').doc(tagName).ref, {count: firebase.firestore.FieldValue.increment(-1)})
      await batch.commit()
  }

}
