import { Component, ViewChild, OnInit, OnDestroy, HostListener, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
          LocalAudioTrack,
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

  //browserOk:boolean = true
  invitation: Invitation;
  private routeSubscription: Subscription;
  //okUrl = true;
  @ViewChild('preview', {static: false}) previewElement: ElementRef;
  @ViewChild('list', {static: false}) listRef: ElementRef;
  isInitializing: boolean = true;
  videoTrack: LocalVideoTrack;
  audioTrack: LocalAudioTrack;
  localTracks: LocalTrack[] = [];
  activeRoom: Room;
  //user: FirebaseUserModel;
  isHost: boolean = false;
  phoneNumber: string; // could be either the guest's number or the host's
  joinOnLoad: boolean;
  participants: Map<Participant.SID, RemoteParticipant>;
  joined = false // whether the user has connected to the room or not
  private roomSubscription: Subscription;
  private altRoomWatcher: Subscription;
  settingsDoc: Settings
  recording_state = "" // "", recording, paused
  connecting: boolean = false
  videoMuted: boolean = false
  audioMuted: boolean = false
  compositionInProgress: boolean = false
  publishButtonText = "Get Recording" // we change this to "Workin' on it" at the beginning of compose()
  callEnded: boolean = false


  constructor(private route: ActivatedRoute,
              private router: Router,
              private invitationService: InvitationService,
              private readonly renderer: Renderer2,
              private http: HttpClient,
              private userService: UserService,
              private roomService: RoomService,
              private settingsService: SettingsService) { }


  async ngOnInit() {
    // got all this stuff from video-call-complete.guard.ts
    this.joinOnLoad = this.route.params['join']
    this.invitation = this.invitationService.invitation
    this.settingsDoc = await this.settingsService.getSettingsDoc()
    this.routeSubscription = this.route.params.subscribe(async params => {
      this.phoneNumber = params['phoneNumber'];
      console.log('VideoCallComponent:  this.phoneNumber = ', this.phoneNumber)
      this.isHost = this.invitation.creatorPhone == this.phoneNumber
    })

  }

/***********
  async ngAfterViewInit() {
      // Are we coming to this page after the video call is already completed?...      
      let xxxx = this.roomService.monitorRoomByInvitationId(this.invitation.id);
      this.altRoomWatcher = xxxx.subscribe(res => {
          if(res.length > 0) { 
              let theRoomObj = res[0].payload.doc.data() as RoomObj
              let videoReady: boolean = theRoomObj.CompositionSid ? true : false // becomes true in twilio-video.js:cutVideoComplete()

              // short-circuit: redirect to /view-video if the video is already produced (just like ViewCallCompleteGuard)
              if(videoReady) {
                  // do what VideoCallCompleteGuard does: redirects to /view-video
                  this.router.navigate(['/view-video', theRoomObj.CompositionSid])
              }
          }
      })


      // should we join the room as soon as we come to this screen?...
      if (this.previewElement && this.previewElement.nativeElement) {
          if(this.joinOnLoad) {
            this.join_call();
          }
      }
  }
  *************/


  ngOnDestroy() {
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
    if(this.roomSubscription) this.roomSubscription.unsubscribe();
    if(this.altRoomWatcher) this.altRoomWatcher.unsubscribe();
  }


  /**
   * "Edge case": Have to allow for guest to hang up, then join again to a call that's still live
   */
  async join_call() {
    this.connecting = true;
    await this.initializeDevice();

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
        this.connecting = false // the process of connecting is done so connecting=false.  We are now connected
      });

  }


  roomObj: RoomObj
  monitorRoom(roomSid: string) {
    // quit this other subscription now that we're monitoring the room by RoomSid
    if(this.altRoomWatcher) this.altRoomWatcher.unsubscribe();

    let xxxx = this.roomService.monitorRoom(roomSid);
    this.roomSubscription = xxxx.subscribe(res => {
      if(res.length > 0) { 
        this.roomObj = res[0].payload.doc.data() as RoomObj
        let videoReady: boolean = this.roomObj.CompositionSid ? true : false // becomes true in twilio-video.js:cutVideoComplete()

        // short-circuit: redirect to /view-video if the video is already produced (just like ViewCallCompleteGuard)
        if(videoReady) {
            console.log('XXXXXXXXXXXXXXXX   this.roomObj = ', this.roomObj)
            // do what VideoCallCompleteGuard does: redirects to /view-video
            this.router.navigate(['/view-video', this.roomObj.CompositionSid])
        }
        else { // normal operation: stay on this screen
            console.log('XXXXXXXXXXXXXXXX   this.roomObj = ', this.roomObj)
            this.disconnect_all_when_host_leaves(this.roomObj)
            this.recording_state = this.roomObj['recording_state']

            this.callEnded = this.roomObj['call_ended_ms'] ? true : false
        }
      }
    })
    
  }


  disconnect_all_when_host_leaves(roomObj: RoomObj) {
    if(!roomObj || !roomObj['guests'] || roomObj['guests'].length === 0) {
      return
    } 
    
    if(roomObj['host_left_ms']) {
      console.log("forced disconnect !!!")
      const connected = this.activeRoom != null && (this.activeRoom.state == "connected" || this.activeRoom.state == "reconnecting" || this.activeRoom.state == "reconnected");
      if(connected) {
        this.activeRoom.disconnect();  
        this.joined = false 
        this.finalizePreview();
      }
    }

  }


  leave_call() {
    if(this.isHost)
        this.stop_recording()
    const connected = this.activeRoom != null && (this.activeRoom.state == "connected" || this.activeRoom.state == "reconnecting" || this.activeRoom.state == "reconnected");
    if(connected) this.activeRoom.disconnect();  
    this.roomService.disconnect(this.roomObj, this.phoneNumber);
    this.joined = false 
    this.finalizePreview();
  }


  async compose() {
    this.compositionInProgress = true
    this.publishButtonText = "Workin' on it!..."
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
        this.audioTrack = this.localTracks.find(t => t.kind === 'audio') as LocalAudioTrack;
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


  /********** handled by video-call-complete.guard.ts
   * 
  isBrowserOk() {
    let mac = navigator.appVersion.toLowerCase().indexOf('mac os x') != -1
    let chrome = navigator.appVersion.toLowerCase().indexOf('chrome') != -1
    let wrongBrowser = mac && chrome;
    this.browserOk = !wrongBrowser;
    return this.browserOk;
  }
  ************/


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
        publication.on('subscribed', this.handleTrackDisabled.bind(this));
        publication.on('subscribed', this.handleTrackEnabled.bind(this));
        publication.on('unsubscribed', track => {
            this.detachRemoteTrack(track)
          }
        );
    }
  }

  

  private detachRemoteTrack(track: RemoteTrack) {
    if (this.isDetachable(track)) {
        console.log('detachRemoteTrack:  track = ', track)
        track.detach().forEach(el => {
            console.log('detachRemoteTrack:  el = ', el)
            el.remove() // makes the video square literally go away
            //this.renderer.setStyle(el, 'background-color', '#000000');
        });
        // GET RID OF THIS
        // this.videoChatService.canSeeRemoteParticipant({myUid: this.myUid, video_node_key: this.video_node_key, canSeeRemote: false});
    }
  }

  

  private isDetachable(track: RemoteTrack): track is RemoteAudioTrack | RemoteVideoTrack {
    return !!track &&
        ((track as RemoteAudioTrack).detach !== undefined ||
        (track as RemoteVideoTrack).detach !== undefined);
  }
  
  
  handleTrackDisabled(track) {
    track.on('disabled', () => {
      /* Hide the associated <video> element and show an avatar image. */
      console.log('track disabled:  ', track)
      this.detachRemoteTrack(track);
    });
  }
  
  
  handleTrackEnabled(track) {
    track.on('enabled', () => {
      /* Hide the associated <video> element and show an avatar image. */
      console.log('track enabled:  ', track)
      this.attachRemoteTrack(track);
    });
  }


  private registerParticipantEvents(participant: RemoteParticipant) {
      if (participant) {
          //this.d('registerParticipantEvents(): participant.tracks='+participant.tracks);
          participant.tracks.forEach(publication => {
              //this.d('registerParticipantEvents(): participant='+participant+':  this.subscribe(publication)');
              this.subscribe(publication);

              // @see   https://www.twilio.com/docs/video/javascript-v2-getting-started#handle-remote-media-mute-events
              if (publication.isSubscribed) {
                  this.handleTrackDisabled(publication.track)
                  this.handleTrackEnabled(publication.track)
              }
          });
          participant.on('trackPublished', publication => {
              console.log('trackPublished:  publication = ', publication)
              //this.d('trackPublished for RemoteParticipant.identity='+participant.identity);
              this.subscribe(publication)              
          });
          participant.on('trackUnpublished', publication => {
            console.log('trackUnpublished:  publication = ', publication)
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
        .on('disconnected', (room: Room) => { /*room.localParticipant.tracks.forEach(publication => this.detachLocalTrack(publication.track))*/ } )
        .on('participantConnected', (participant: RemoteParticipant) => this.addParticipant(participant))
        .on('participantDisconnected', (participant: RemoteParticipant) => this.removeParticipant(participant))
        //.on('trackDisabled', track => {
        //    console.log('remote trackDisabled:  track = ', track)
        //})
        //.on('trackEnabled', track => {
        //    console.log('remote trackEnabled:  track = ', track)
        //})

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
    if(!this.roomObj['mark_time']) {// leave_call() calls stop_recording().  There could be a non-existent or empty 'mark_time' object
        console.log("there is no mark_time element")
        return
    }
    let lastIdx = this.roomObj['mark_time'].length - 1
    if(lastIdx == -1) {
        console.log("lastIdx = ", lastIdx)        
        return
    }
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

  setVideoMute(prevValue: boolean) {
      this.videoMuted = !prevValue
      if(this.videoMuted) this.videoTrack.disable()
      else this.videoTrack.enable()
  }

  setAudioMute(prevValue: boolean) {
      this.audioMuted = !prevValue
      if(this.audioMuted) this.audioTrack.disable()
      else this.audioTrack.enable()
  }


  /**
    remoteParticipant.on('trackDisabled', track => {
      // hide or remove the media element related to this track
    }); 



    remoteParticipant.on('trackEnabled', track => {
      // show the track again
    });


   */


}
