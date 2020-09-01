import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
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
import * as firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(
    private afs: AngularFirestore,) { 
  }


  saveRoom(roomObj: any) {
    // How do we keep from overwriting data when the second person joins?
    // see video-call.component.ts:join_call()
    console.log('YYYYYYYYYYYY roomObj = ', roomObj)
    this.afs.collection('room').doc(roomObj['RoomSid']).set(roomObj)
  }


  /**
   * 
   * @param rm the twilio room
   * @param invitation 
   * @param phoneNumber the phone of the current user - compare with the phone numbers in the invitation object to tell 
   * if this person is the host or a guest 
   */
  createRoomObj(rm: Room, invitation: Invitation, phoneNumber: string) {
    let roomObj = {        
      RoomSid: rm.sid,
      created_ms: new Date().getTime(),
      hostId: invitation.creatorId,
      hostName: invitation.creatorName,
      hostPhone: invitation.creatorPhone,
      invitationId: invitation.id,
      guests: [
        { guestName: invitation.displayName, guestPhone: invitation.phoneNumber }
      ],
      recording_state: '',
      mark_time: [], // the start- and stop-recording times
    }
    if(phoneNumber === invitation.phoneNumber) roomObj['guests'][0]['joined_ms'] = new Date().getTime()
    else roomObj['host_joined_ms'] = new Date().getTime()
    
    return roomObj;
  }


  // the room already exists.  see video-call.component.ts:join_call()
  // the join time here is for someone OTHER than the first person to join.  The first person's join time is 
  // written when the room is created/connected to
  addJoinTime(roomObj: any, invitation: Invitation, phoneNumber: string) {
    let isHost = invitation.creatorPhone === phoneNumber;
    if(isHost) {
      roomObj['host_joined_ms'] = new Date().getTime()
    }
    else {
      let guest = _.find(roomObj['guests'], obj => {
        return obj['guestPhone'] === phoneNumber
      })
      guest['joined_ms'] = new Date().getTime()
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
  async saveOnJoin(rm: Room, invitation: Invitation, phoneNumber: string) {
    
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
        this.addJoinTime(roomObj, invitation, phoneNumber)
      }
      else {
        roomObj = this.createRoomObj(rm, invitation, phoneNumber);
      }
      
      this.saveRoom(roomObj);

    });


  }


  monitorRoom(roomSid: string) {
    var retThis = this.afs.collection('room', ref => ref.where("RoomSid", "==", roomSid)).snapshotChanges();
    return retThis;
  }


  disconnect(roomObj: RoomObj, phoneNumber: string) {
    // is this the host phone or the guest phone?
    let isHost = roomObj.hostPhone === phoneNumber;
    if(isHost) {
      this.disconnectHost(roomObj, phoneNumber)
    }
    else {     
      this.disconnectGuest(roomObj, phoneNumber)
    }
    
  }


  /**
   * If the host is disconnecting, then all other participants should be disconnected also
   * and the call is over.
   */
  private disconnectHost(roomObj: RoomObj, phoneNumber: string) {
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


  /**
   * Sets the 'recording_state' attribute on the Room doc so that all connected clients
   * know whether recording is on/off/paused
   * @see video-call.component.ts:monitorRoom()
   * @param state
   */
  setRecordingState(roomObj: RoomObj) {
    this.afs.collection('room').doc(roomObj['RoomSid']).update({recording_state: roomObj['recording_state'], mark_time: roomObj['mark_time']})
  }



}
