import { Injectable } from '@angular/core';
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


@Injectable({
  providedIn: 'root'
})
export class RoomService {

  // hack for passing room from video-ready.guard to view-video.component
  roomObj: RoomObj
  isHost = false

  official_selected = new Subject<Official>()
  official_deleted = new Subject<Official>()

  constructor(
    private settingsService: SettingsService,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,) { 
  }


  saveRoom(roomObj: any) {
    // How do we keep from overwriting data when the second person joins?
    // see video-call.component.ts:join_call()
    this.afs.collection('room').doc(roomObj['RoomSid']).set(roomObj)
  }


  /**
   * 
   * @param rm the twilio room
   * @param invitation 
   * @param phoneNumber the phone of the current user - compare with the phone numbers in the invitation object to tell 
   * if this person is the host or a guest 
   */
  createRoomObj(rm: Room, invitations: Invitation[], phoneNumber: string) {
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
        recording_state: '',
        mark_time: [], // the start- and stop-recording times
    }
    let guest = _.find(roomObj['guests'], g => {
        return g['guestPhone'] === phoneNumber
    })
    if(guest) {
        guest['joined_ms'] = new Date().getTime()
    }
    //if(phoneNumber === invitation.phoneNumber) roomObj['guests'][0]['joined_ms'] = new Date().getTime()
    else roomObj['host_joined_ms'] = new Date().getTime()
    
    return roomObj;
  }


  // the room already exists.  see video-call.component.ts:join_call()
  // the join time here is for someone OTHER than the first person to join.  The first person's join time is 
  // written when the room is created/connected to
  addJoinTime(roomObj: any, invitations: Invitation[], phoneNumber: string) {
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
    
    roomDocs.subscribe(data  => {
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
        this.addJoinTime(roomObj, invitations, phoneNumber)
      }
      else {
        roomObj = this.createRoomObj(rm, invitations, phoneNumber);
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


  disconnect(roomObj: RoomObj, phoneNumber: string) {
    // is this the host phone or the guest phone?
    let isHost = roomObj.hostPhone === phoneNumber;
    if(isHost) {
      this.disconnectEveryone(roomObj, phoneNumber)
    }
    else {     
      this.disconnectGuest(roomObj, phoneNumber)
    }
    
  }


  /**
   * If the host is disconnecting, then all other participants should be disconnected also
   * and the call is over.
   */
  private disconnectEveryone(roomObj: RoomObj, phoneNumber: string) {
    roomObj['host_left_ms'] = new Date().getTime()
    _.each(roomObj['guests'], guest => {
      guest['left_ms'] = new Date().getTime()
    })
    roomObj['call_ended_ms'] = new Date().getTime()
    this.saveRoom(roomObj);
  }


  private disconnectGuest(roomObj: RoomObj, phoneNumber: string) {
    let guest = _.find(roomObj['guests'], obj => {
      return obj['guestPhone'] === phoneNumber
    })
    guest['left_ms'] = new Date().getTime()
    this.saveRoom(roomObj);
    
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


  // async copyRoom(roomSid: string) {
  //     let roomDoc = await this.afs.collection('room').doc(roomSid).ref.get()
  //     let tempId = 'RM'+(new Date().getTime())
  //     await this.afs.collection('room').doc(tempId).set(roomDoc.data())
  // }


  async getRoomsWithGuest(name: {guestName: string, guestPhone: string}) {      

      let observable = this.afs.collection('room', ref => ref.where('guests', 'array-contains', {guestName: name.guestName, guestPhone: name.guestPhone} )).snapshotChanges().pipe(take(1));
      
      let docChangeActions = await observable.toPromise()
      var rooms: RoomObj[] = []
      if(docChangeActions && docChangeActions.length > 0) {
          _.each(docChangeActions, obj => {
              let data = obj.payload.doc.data()
              let docId = obj.payload.doc.id
              rooms.push(data as RoomObj)
              console.log('getRoomsWithGuest(): ',docId, ':  ', data)
          })
      }
      return rooms

  }


  async getRoomsWithHost(person: {uid: string}) {
      
      let observable = this.afs.collection('room', ref => ref.where('hostId', '==', person.uid )).snapshotChanges().pipe(take(1));
        
      let docChangeActions = await observable.toPromise()
      var rooms: RoomObj[] = []
      if(docChangeActions && docChangeActions.length > 0) {
          _.each(docChangeActions, obj => {
              let data = obj.payload.doc.data()
              let docId = obj.payload.doc.id
              rooms.push(data as RoomObj)
              console.log('getRoomsWithHost(): ',docId, ':  ', data)
          })
      }
      return rooms
  }


  /**
   * For admins to review rooms/videos  (admin/video/video-list)
   */
  getRooms() {
      let observable = this.afs.collection('room', ref => ref.orderBy('created_ms', 'desc').limit(5)).snapshotChanges()//.pipe(take(1));
      return observable
      
      // let docChangeActions = await observable.toPromise()
      // var rooms: RoomObj[] = []
      // if(docChangeActions && docChangeActions.length > 0) {
      //     _.each(docChangeActions, obj => {
      //         let data = obj.payload.doc.data()
      //         let docId = obj.payload.doc.id
      //         rooms.push(data as RoomObj)
      //         // console.log('getRooms(): ',docId, ':  ', data)
      //     })
      // }
      // console.log('getRooms(): rooms = ', rooms)
      // return rooms      
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

}
