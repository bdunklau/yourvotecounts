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
import { Observable } from 'rxjs';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(
    private afs: AngularFirestore,) { 
  }


  async saveRoom(roomObj: any) {
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
      ]
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
          roomObj['RoomSid'] = roomDoc.payload.doc.data()['RoomSid']
          roomObj['created_ms'] = roomDoc.payload.doc.data()['created_ms']
          roomObj['hostId'] = roomDoc.payload.doc.data()['hostId']
          roomObj['hostName'] = roomDoc.payload.doc.data()['hostName']
          roomObj['hostPhone'] = roomDoc.payload.doc.data()['hostPhone']
          roomObj['invitationId'] = roomDoc.payload.doc.data()['invitationId']
          roomObj['guests'] = roomDoc.payload.doc.data()['guests'];
          if(roomDoc.payload.doc.data()['host_joined_ms']) {
            roomObj['host_joined_ms'] = roomDoc.payload.doc.data()['host_joined_ms']
          }
          //else {
          //  this.addJoinTime(roomObj, invitation, phoneNumber)
          //}
          console.log('XXXXXXXXXX  roomObj = ', roomObj)
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




}
