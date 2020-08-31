import { Component, ViewChild, OnInit, OnDestroy, HostListener, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Invitation } from '../../invitation/invitation.model';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { InvitationService } from '../../invitation/invitation.service';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from '../../user/user.model';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';  // ref:   https://angular.io/guide/http
// should go in a service ??
import { connect,
          Participant,
          RemoteTrack,
          RemoteAudioTrack,
          RemoteVideoTrack,
          RemoteParticipant,
          RemoteTrackPublication,
          ConnectOptions,
          LocalTrack,
          LocalVideoTrack,
          Room,
          createLocalTracks } from 'twilio-video';
import { RoomService } from '../../room/room.service';
import { RoomObj } from '../../room/room-obj.model';
import { map, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.model';
import * as moment from 'moment';


@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit {

  browserOk:boolean = true
  invitation: Invitation;
  private routeSubscription: Subscription;
  okUrl = true;
  @ViewChild('preview', {static: false}) previewElement: ElementRef;
  @ViewChild('list', {static: false}) listRef: ElementRef;
  isInitializing: boolean = true;
  videoTrack: LocalVideoTrack;
  localTracks: LocalTrack[] = [];
  activeRoom: Room;
  //user: FirebaseUserModel;
  isHost: boolean = false;
  phoneNumber: string; // could be either the guest's number or the host's
  joinOnLoad: boolean;
  participants: Map<Participant.SID, RemoteParticipant>;
  joined = false // whether the user has connected to the room or not
  private roomSubscription: Subscription;
  settingsDoc: Settings
  recording_state = "" // "", recording, paused


  constructor(private route: ActivatedRoute,
              private invitationService: InvitationService,
              private readonly renderer: Renderer2,
              private http: HttpClient,
              private userService: UserService,
              private roomService: RoomService,
              private settingsService: SettingsService) { }

  async ngOnInit() {
    if(!this.isBrowserOk())
      return;
    //this.user = await this.userService.getCurrentUser();
    this.routeSubscription = this.route.data.subscribe(routeData => {
      console.log('routeData = ', routeData);
      if(!routeData['invitation']) {
        this.okUrl = false;
        return;
      }
      let data = routeData['invitation'];
      this.invitation = data.invitation
      if(!this.invitation) {
        this.okUrl = false;
        return;
      }
      this.isHost = data.isHost ? true : false;
      this.phoneNumber = data.phoneNumber;
      if(data.join) {
        // join right away
        this.joinOnLoad = true;
      }

      //console.log('navigator = ', navigator); to see the operation sys, browser type and other stuff
      
    })

    this.settingsDoc = await this.settingsService.getSettingsDoc()
  }


  async ngAfterViewInit() {
    if (this.previewElement && this.previewElement.nativeElement) {
        await this.initializeDevice();
        if(this.joinOnLoad) {
          this.join_call();
        }
    }
  }


  ngOnDestroy() {
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
    if(this.roomSubscription) this.roomSubscription.unsubscribe();
  }


  async join_call() {
    let roomName = this.invitation.id;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'my-auth-token',
        'Access-Control-Allow-Origin': '*'
      }),
      //params: new HttpParams().set('uid', uid)
    };

    this.http.get(`https://${this.settingsDoc.firebase_functions_host}/generateTwilioToken?room_name=${roomName}&name=${this.phoneNumber}`, httpOptions)
      .subscribe(async (data: any) => {
        
        this.activeRoom = await connect(
                data.token, {
                  logLevel: 'debug',
                  name: roomName,
                  preferredAudioCodecs: ['isac'],
                  preferredVideoCodecs: ['H264'],
                  tracks: this.localTracks,
                  // dominantSpeaker: true,
                  // automaticSubscription: true
              } as ConnectOptions);
        console.log('this.activeRoom = ', this.activeRoom);
        this.joined = true
        await this.roomService.saveOnJoin(this.activeRoom, this.invitation, this.phoneNumber)
        this.monitorRoom(this.activeRoom.sid)
        this.initialize(this.activeRoom.participants)  
        this.registerRoomEvents()
      });

  }


  roomObj: RoomObj
  monitorRoom(roomSid: string) {
    //console.log('XXXXXXXXXXXXXXXX   roomSid = ', roomSid);
    let xxxx = this.roomService.monitorRoom(roomSid);
    //console.log('XXXXXXXXXXXXXXXX   xxxx = ', xxxx);
    this.roomSubscription = xxxx.subscribe(res => {
      //console.log('XXXXXXXXXXXXXXXX   res = ', res)
      if(res.length > 0) { 
        this.roomObj = res[0].payload.doc.data() as RoomObj
        console.log('XXXXXXXXXXXXXXXX   this.roomObj = ', this.roomObj)
        this.disconnect_all_when_host_leaves(this.roomObj)
        this.recording_state = this.roomObj['recording_state']
      }
    })
    

  }


  disconnect_all_when_host_leaves(roomObj: RoomObj) {
    if(!roomObj || !roomObj['guests'] || roomObj['guests'].length === 0) {
      return
    } 
    let me = _.find(this.roomObj['guests'], guest => {
      return guest["guestPhone"] === this.phoneNumber
    })
    if(me && me['left_ms']) {
      const connected = this.activeRoom != null && (this.activeRoom.state == "connected" || this.activeRoom.state == "reconnecting" || this.activeRoom.state == "reconnected");
      if(connected) this.activeRoom.disconnect();  
      this.joined = false 
    }

  }


  leave_call() {
    const connected = this.activeRoom != null && (this.activeRoom.state == "connected" || this.activeRoom.state == "reconnecting" || this.activeRoom.state == "reconnected");
    if(connected) this.activeRoom.disconnect();  
    this.roomService.disconnect(this.roomObj, this.phoneNumber);
    this.joined = false 
  }


  async compose() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'my-auth-token',
        'Access-Control-Allow-Origin': '*'
      }),
      //params: new HttpParams().set('uid', uid)
    };

    // do a POST here not a GET
    // and post the whole room document.  No need to query for it in the firebase function

    // NOTE: ${this.settingsDoc.website_domain_name} will be the ngrok host if running locally.  See invitation.service.ts:ngrok field
    let composeUrl = `https://${this.settingsDoc.firebase_functions_host}/compose?RoomSid=${this.activeRoom.sid}&firebase_functions_host=${this.settingsDoc.firebase_functions_host}&room_name=${this.activeRoom.name}&website_domain_name=${this.settingsDoc.website_domain_name}&cloud_host=${this.settingsDoc.cloud_host}                         `
    this.http.get(composeUrl, httpOptions)
      .subscribe(async (data: any) => {
        console.log('data = ', data) 
              
    });

  }


  private async initializeDevice(kind?: MediaDeviceKind, deviceId?: string) {
    try {
        this.isInitializing = true;

        this.finalizePreview();

        this.localTracks = kind && deviceId
            ? await this.initializeTracks(kind, deviceId)
            : await this.initializeTracks();

        this.videoTrack = this.localTracks.find(t => t.kind === 'video') as LocalVideoTrack;
        const videoElement = this.videoTrack.attach();
        // console.log('videoElement = ', videoElement);
        // this.d('initializeDevice(): videoElement='+videoElement);
        // this.renderer.setStyle(videoElement, 'mute', 'true');
        this.renderer.setStyle(videoElement, 'height', '100%');
        this.renderer.setStyle(videoElement, 'width', '100%');
        this.renderer.appendChild(this.previewElement.nativeElement, videoElement);
    } finally {
        this.isInitializing = false;
    }
  }




  finalizePreview() {
    try {
        if (this.videoTrack) {
            this.videoTrack.detach().forEach(element => {
                element.remove()
              }
            );
        }
    } catch (e) {
        console.error(e);
    }
  }


  

  private initializeTracks(kind?: MediaDeviceKind, deviceId?: string) {
    if (kind) {
        switch (kind) {
            case 'audioinput':
                return createLocalTracks({ audio: { deviceId }, video: true });
            case 'videoinput':
                return createLocalTracks({ audio: true, video: { deviceId } });
        }
    }

    return createLocalTracks({ audio: true, video: true });
  }


  isBrowserOk() {
    let mac = navigator.appVersion.toLowerCase().indexOf('mac os x') != -1
    let chrome = navigator.appVersion.toLowerCase().indexOf('chrome') != -1
    let wrongBrowser = mac && chrome;
    this.browserOk = !wrongBrowser;
    return this.browserOk;
  }


  private attachRemoteTrack(track: RemoteTrack) {
    if (this.isAttachable(track)) {
        // this method called twice for a participant
        // the first time, element is an <audio> element, type unknown
        // the second time, element is a <video> element, type unknown
        const element = track.attach();
        this.renderer.data.id = track.sid;
        this.renderer.setStyle(element, 'width', '30vw');
        // this.renderer.setStyle(element, 'height', '28vh');
        this.renderer.setStyle(element, 'margin-left', '0%');
        this.renderer.appendChild(this.listRef.nativeElement, element);
    }
  
  }




  private isAttachable(track: RemoteTrack): track is RemoteAudioTrack | RemoteVideoTrack {
    return !!track &&
        ((track as RemoteAudioTrack).attach !== undefined ||
        (track as RemoteVideoTrack).attach !== undefined);
  }  


  private subscribe(publication: RemoteTrackPublication | any) {
    if (publication && publication.on) {
        publication.on('subscribed', track => {
            this.attachRemoteTrack(track)
          }
        );
        publication.on('unsubscribed', track => {
            this.detachRemoteTrack(track)
          }
        );
    }
  }

  

  private detachRemoteTrack(track: RemoteTrack) {
    if (this.isDetachable(track)) {
        track.detach().forEach(el => el.remove());
        // GET RID OF THIS
        // this.videoChatService.canSeeRemoteParticipant({myUid: this.myUid, video_node_key: this.video_node_key, canSeeRemote: false});
    }
  }

  

  private isDetachable(track: RemoteTrack): track is RemoteAudioTrack | RemoteVideoTrack {
    return !!track &&
        ((track as RemoteAudioTrack).detach !== undefined ||
        (track as RemoteVideoTrack).detach !== undefined);
  }


  private registerParticipantEvents(participant: RemoteParticipant) {
     if (participant) {
         //this.d('registerParticipantEvents(): participant.tracks='+participant.tracks);
         participant.tracks.forEach(publication => {
             //this.d('registerParticipantEvents(): participant='+participant+':  this.subscribe(publication)');
             this.subscribe(publication);
         });
         participant.on('trackPublished', publication => {
             //this.d('trackPublished for RemoteParticipant.identity='+participant.identity);
             this.subscribe(publication)
           }
         );
         participant.on('trackUnpublished',
             publication => {
                 if (publication && publication.track) {
                    //this.d('trackUnpublished for RemoteParticipant.identity='+participant.identity);
                    this.detachRemoteTrack(publication.track);
                 }
             });
     }
  }

  
  initialize(participants: Map<Participant.SID, RemoteParticipant>) {
    this.participants = participants;
    if (this.participants) {
        this.participants.forEach(participant => this.registerParticipantEvents(participant));
    }
  }


  addParticipant(participant: RemoteParticipant) {
    //this.d('add RemoteParticipant: '+participant.identity); // GOOD - we see this
    if (this.participants && participant) {
        this.participants.set(participant.sid, participant);
        this.registerParticipantEvents(participant);
    }
  }


  private registerRoomEvents() {
    this.activeRoom
        .on('disconnected',
            (room: Room) => { /*room.localParticipant.tracks.forEach(publication => this.detachLocalTrack(publication.track))*/ }
          )
        .on('participantConnected',
            (participant: RemoteParticipant) => /*this.participants.add*/this.addParticipant(participant))
        .on('participantDisconnected',
            (participant: RemoteParticipant) => /*this.participants.remove*/this.removeParticipant(participant))
        // .on('trackSubscribed', (track:RemoteTrack, publication:RemoteTrackPublication, participant:RemoteParticipant) => {
        //     this.d('registerRoomEvents(): track = '+ track);
        //     this.d('registerRoomEvents(): publication = '+ publication);
        //     this.d('registerRoomEvents(): participant = '+ participant);
        // })
        // .on('dominantSpeakerChanged',
        //     (dominantSpeaker: RemoteParticipant) => this.participants.loudest(dominantSpeaker));
  }

  
  removeParticipant(participant: RemoteParticipant) {
    if (this.participants && this.participants.has(participant.sid)) {
        this.participants.delete(participant.sid);
    }
  }


  start_recording() {
    this.roomObj['recording_state'] = "recording"
    this.roomObj['mark_time'] = []
    let now = new Date().getTime()
    let diff = this.getTimeDiff({first: this.roomObj.host_joined_ms, second: now })
    this.roomObj['mark_time'].push({"start_recording_ms": now, "start_recording": diff})
    this.setRecordingState()
  } 

  stop_recording() {
    this.roomObj['recording_state'] = ""
    let lastIdx = this.roomObj['mark_time'].length - 1
    let lastTimePair = this.roomObj['mark_time'][lastIdx]
    if(!lastTimePair["duration"]) {
      let diff = this.getTimeDiff({first: lastTimePair['start_recording_ms'], second: new Date().getTime()})
      lastTimePair['duration'] = diff
    }
    this.setRecordingState()
  }

  pause_recording() {
    this.roomObj['recording_state'] = "paused"
    let lastIdx = this.roomObj['mark_time'].length - 1
    let lastTimePair = this.roomObj['mark_time'][lastIdx]
    if(!lastTimePair["duration"]) {
      let diff = this.getTimeDiff({first: lastTimePair['start_recording_ms'], second: new Date().getTime()})
      lastTimePair['duration'] = diff
    }
    this.setRecordingState()
  }

  resume_recording() {
    this.roomObj['recording_state'] = "recording"
    let now = new Date().getTime()
    let diff = this.getTimeDiff({first: this.roomObj.host_joined_ms, second: now})
    this.roomObj['mark_time'].push({"start_recording_ms": now, "start_recording": diff})
    this.setRecordingState()
  }

  private setRecordingState() {
    this.roomService.setRecordingState(this.roomObj)
  }

  getTimeDiff(time: {first: number, second: number}) { 
    let diff = moment.utc(moment(time.second).diff(moment(time.first))).format("HH:mm:ss")
    //console.log('diff = ', diff);
    return diff
  }


}