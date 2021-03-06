import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit, ElementRef, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Invitation } from '../../invitation/invitation.model';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { InvitationService } from '../../invitation/invitation.service';
import { UserService } from '../../user/user.service';
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
import * as _ from 'lodash';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.model';
import moment from 'moment';
import { isPlatformBrowser } from '@angular/common';
import { MessageService } from '../../core/message.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from '../../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { VideoGuestEditorComponent } from '../video-guest-editor/video-guest-editor.component';


@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit {

  //browserOk:boolean = true
  //invitation: Invitation;
  invitations: Invitation[];
  private routeSubscription: Subscription;
  //okUrl = true;
  @ViewChild('preview', {static: false}) previewElement: ElementRef;
  @ViewChild('list', {static: false}) listRef: ElementRef;
  @ViewChild('videoCells', {static: false}) videoCellsRef: ElementRef; // instead of #list
  
  // @ViewChild('guest1', {static: false}) guest1Ref: ElementRef;  
  // @ViewChild('guest2', {static: false}) guest2Ref: ElementRef;  
  // @ViewChild('guest3', {static: false}) guest3Ref: ElementRef;

  // private guestRefs: ElementRef[]

  isInitializing: boolean = true;
  videoTrack: LocalVideoTrack;
  audioTrack: LocalAudioTrack;
  localTracks: LocalTrack[] = [];
  screenTrack: LocalVideoTrack
  screenStream: any
  screenElement: HTMLVideoElement
  activeRoom: Room;
  //user: FirebaseUserModel;
  isHost: boolean = false;
  phoneNumber: string; // could be either the guest's number or the host's
  participants: Map<Participant.SID, RemoteParticipant>;
  joined = false // whether the user has connected to the room or not
  private roomSubscription: Subscription;
  private invitationWatcher: Subscription;
  private altRoomWatcher: Subscription;
  settingsDoc: Settings
  recording_state = "" // "", recording, paused
  connecting: boolean = false
  videoMuted: boolean = false
  audioMuted: boolean = false
  screenIsShared = false
  // compositionInProgress: boolean = false
  // publishButtonText = "Get Recording" // we change this to "Workin' on it" at the beginning of compose()
  callEnded: boolean = false
  canDelete: boolean = true
  // me: FirebaseUserModel
  //trackMap: Map<RemoteTrack, ElementRef> = new Map<RemoteTrack, ElementRef>()
  showTestPattern = true
  dimension: {type:string, value:string} = {type:'width', value:'49vw'}
  timeRemaining: number
  translated = false
  translatedGuest = false
  collapsed = false
  collapsedGuest = false
  // canAddPeople = false
  maxGuests: number
  countDownInterval
  // selectedInvitation: Invitation
  @ViewChild('editGuestDirective')  videoGuestEditorComponent: VideoGuestEditorComponent


  constructor(private route: ActivatedRoute,
              private router: Router,
              private invitationService: InvitationService,
              private readonly renderer: Renderer2,
              private http: HttpClient,
              private userService: UserService,
              private roomService: RoomService,
              @Inject(PLATFORM_ID) private platformId,
              private messageService: MessageService,
              private _modalService: NgbModal,
              private settingsService: SettingsService) { }


  async ngOnInit() {
    
      if(isPlatformBrowser(this.platformId)) {
        
          console.log('ngOnInit:  HEADSUP-96')
        
          // got all this stuff from video-call-complete.guard.ts
          //this.me = await this.userService.getCurrentUser() // this is NOT how we tell if I am the guest
          this.invitations = this.invitationService.invitations  // see  ValidInvitationGuard
          console.log('VideoCallComponent:  this.invitations = ', this.invitations)
          this.settingsDoc = await this.settingsService.getSettingsDoc()
          console.log('this.settingsService.getSettingsDoc()... GOT IT -> ', this.settingsDoc)
          this.maxGuests = this.settingsService.maxGuests
          this.phoneNumber = this.route.snapshot.params.phoneNumber
          this.isHost = this.invitations[0].creatorPhone == this.phoneNumber

          // this.routeSubscription = this.route.params.subscribe(async params => {
          //     this.phoneNumber = params['phoneNumber'];
          //     console.log('VideoCallComponent:  this.phoneNumber = ', this.phoneNumber)
          //     this.isHost = this.invitations[0].creatorPhone == this.phoneNumber
          // })

          // this.setVideoWidthHeight(this.invitations.length)
          
          // optional: override default width/height of the video cells 
          let dim = this.route.snapshot.params.dimension
          if(dim && dim.indexOf('vw') != -1) {
              this.dimension.type = 'width'
              this.dimension.value = dim
          }
          else if(dim && dim.indexOf('vh') != -1) {
              this.dimension.type = 'height'
              this.dimension.value = dim
          }
          console.log('ngOnInit():  dimension = ', this.dimension)

          // this.listenForTimerEvents()

          _.each(this.invitations, invitation => {
              this.monitorInvitation(invitation)
          })
          
      }
  }

  ngAfterViewInit() {
    
  }


  /**
   * timer.component.ts - TODO but logic in timer.component.ts should probably be in a service
   * Notifications shouldn't have to come from a GUI component 
   */
  // handleTimerEvent(event: string) {
  //     if(event === 'warning time reached') {
  //         // display modal - probably to host only - warning of time
  //     }
  //     else if(event === "max time reached") {
  //         // forcibly end the call
  //     }
  // }


  // private listenForTimerEvents() {
  //     this.messageService.listenForTimerEvents().subscribe({
  //       next: this.handleTimerEvent,
  //       error: function(value) {
  //       },
  //       complete: function() {
  //       }
  //     })
  // }


  setVideoWidthHeight(numberOfInvitations: number) {
      let numberOfParticipants =  numberOfInvitations + 1
      if(numberOfParticipants === 1) this.dimension = {type:'width', value:'99vw'}
      else if(numberOfParticipants === 2) this.dimension = {type:'width', value:'49vw'}
      else if(numberOfParticipants === 3) this.dimension = {type:'width', value:'33vw'}
      else this.dimension = {type:'width', value:'25vw'}
  }


  // ngAfterViewInit() {      
  //     if(isPlatformBrowser(this.platformId)) {

  //         this.guestRefs = [this.guest3Ref, this.guest2Ref, this.guest1Ref] // reverse order so we can call .pop() below
  //         console.log('ngAfterViewInit():   this.guestRefs = ', this.guestRefs)
  //     }
  // }


  ngOnDestroy() {
      if(this.routeSubscription) this.routeSubscription.unsubscribe()
      if(this.roomSubscription) this.roomSubscription.unsubscribe()
      if(this.altRoomWatcher) this.altRoomWatcher.unsubscribe()
      if(this.invitationWatcher) this.invitationWatcher.unsubscribe()
      if(this.countDownInterval) clearInterval(this.countDownInterval)
      console.log('ngOnDestroy()')
  }


  /**
   * "Edge case": Have to allow for guest to hang up, then join again to a call that's still live
   */
  async join_call() {
    this.canDelete = false
    this.connecting = true;
    await this.initializeDevice();

    let roomName = this.invitations[0].invitationId; // id is shared among all guests

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
            await this.roomService.saveOnJoin(this.activeRoom, this.invitations, this.phoneNumber)
            this.monitorRoom(this.activeRoom.sid)
            this.initialize(this.activeRoom.participants)  
            this.registerRoomEvents()
            this.connecting = false // the process of connecting is done so connecting=false.  We are now connected
            if(this.isHost) {
                this.startClock() // to keep time, and notify other listeners
            }
        });

  }


  private startClock() {
      let maxSeconds = this.settingsDoc.max_call_time
      this.timeRemaining = maxSeconds
      let warnAt = 60
      var maxTimeWatcher = function() {
          console.log('maxTimeWatcher --------')
          --this.timeRemaining
          // give a single warning at 1 minute before
          if(this.timeRemaining == warnAt) {
              this.warningTimeReached()
          }
          else if(this.timeRemaining == -15) { // 15 secs grace period after time runs out
              // forcibly end the call
              this.leave_call()
          }
      }.bind(this)
      
      this.countDownInterval = setInterval(() => maxTimeWatcher(), 1000)
  }


  warningTimeReached() {      
      var modalRef = this.showOkDialog(() => {/*noop*/});
      modalRef.componentInstance.title = `One Minute Remaining`;
      modalRef.componentInstance.question = 'There is only one minute remaining on your call.  This call will automatically end in one minute.';
      modalRef.componentInstance.thing = '';
      modalRef.componentInstance.warning_you = '';
      modalRef.componentInstance.really_warning_you = '';
  }

  

  showOkDialog(callback) {
    const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});
    modalRef.result.then(async (result) => {
      // the ok/delete case
      // this.closeResult = `Closed with: ${result}`;

      // so that we get updated memberCount and leaderCount
      // this.team = await this.teamService.deleteTeamMember(team_member);
      callback();
    }, (reason) => {
      // the cancel/dismiss case
      // this.closeResult = `Dismissed ${reason}`;
    });
    
    modalRef.componentInstance.showCancelButton = false // hides the Cancel button
    modalRef.componentInstance.danger = false // makes the OK button gray instead of red
    return modalRef;
  }


  /**
   * Has someone else joined this room/call ?
   * @param roomObj 
   */
  private someoneHasJoined(roomObj: RoomObj) {
      if(!roomObj) return false
      if(!roomObj.guests) return false
      if(roomObj.guests.length < 1) return
      let joined = _.find(roomObj.guests, guest => {
          return guest['joined_ms'] != null
      })
      return joined
  }


  roomObj: RoomObj
  monitorRoom(roomSid: string) {
    // quit this other subscription now that we're monitoring the room by RoomSid
    if(this.altRoomWatcher) this.altRoomWatcher.unsubscribe();

    let xxxx = this.roomService.monitorRoom(roomSid);
    this.roomSubscription = xxxx.subscribe(res => {
      if(res.length > 0) { 
        let someoneAlreadyJoined = this.someoneHasJoined(this.roomObj)
        this.roomObj = res[0].payload.doc.data() as RoomObj
        let someoneJoined = this.someoneHasJoined(this.roomObj)
        let firstGuestJoined = !someoneAlreadyJoined && someoneJoined
        this.canDelete = this.canDelete && !firstGuestJoined
        
        // // video-call.guard should check this and keep us from coming to this page if the Composition already exists
        // let videoReady: boolean = this.roomObj.CompositionSid ? true : false // becomes true in twilio-video.js:cutVideoComplete()

        // // short-circuit: redirect to /view-video if the video is already produced (just like ViewCallCompleteGuard)
        // if(videoReady) {
        //     console.log('XXXXXXXXXXXXXXXX   this.roomObj = ', this.roomObj)
        //     // do what VideoCallCompleteGuard does: redirects to /view-video
        //     this.router.navigate(['/view-video', this.roomObj.CompositionSid])
        // }
        // else { // normal operation: stay on this screen
        //     console.log('XXXXXXXXXXXXXXXX   this.roomObj = ', this.roomObj)
        //     this.disconnect_all_when_host_leaves(this.roomObj)
        //     this.recording_state = this.roomObj['recording_state']

        //     this.callEnded = this.roomObj['call_ended_ms'] ? true : false
        // }
        
        this.disconnect_all_when_host_leaves(this.roomObj)
        this.recording_state = this.roomObj['recording_state']
        this.messageService.updateRecordingStatus(this.recording_state)
        //this.callEnded = this.roomObj['call_ended_ms'] ? true : false

      }
    })
    
  }


  /**
   * watch for the invitation to be deleted
   * The effect:  a guest is deleted
   */
  monitorInvitation(invitation: Invitation) {
      let xxxx = this.invitationService.monitorInvitation(invitation.docId)
      this.invitationWatcher = xxxx.subscribe( res => {
          console.log('monitorInvitation():  res: ', res)
          let inv = res.payload.data() as Invitation
          if(inv.deleted_ms != -1) {
              // remove the deleted guest
              _.remove(this.invitations, (invitation:Invitation) => {
                  return invitation.phoneNumber === inv.phoneNumber
              })
              this.invitationService.invitations = this.invitations // just keeping this.invitationService.invitations in sync

              // find out if guest deleted was "me" 
              if(inv.phoneNumber === this.phoneNumber) // route.params should have returned phoneNumber by the time we try to delete someone
                  this.router.navigate(['/invitation-deleted'])
          }
      })
  }


  async delete_guest(invitation) {
      let callCancelled = false
      if(this.invitations.length == 1) {
          callCancelled = true
      }
      await this.invitationService.deleteInvitation(invitation.docId)
      // deleting from this.invitation happens in monitorInvitations()
      if(callCancelled)
          this.router.navigate(['/invitation-deleted'])
  }


  delete_invitations() {
      // id's can be shared - that's how we know who all is invited to be on a call
      let sharedInvitationId = this.invitations[0].invitationId
      this.invitationService.deleteInvitations(sharedInvitationId)
      this.router.navigate(['/invitation-deleted'])
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
        console.log('HEADSUP-96')
        delete this.invitationService.invitations
        this.invitationService.invitations = []
        // this.router.navigate(['/video-call-complete', this.activeRoom.sid, 'guest', this.phoneNumber])
        console.log('HEADSUP-97')
        window.location.href = `/video-call-complete/${this.activeRoom.sid}/guest/${this.phoneNumber}`
      }
    }

  }


  async leave_call() {
    if(this.isHost)
        this.stop_recording()
    const connected = this.activeRoom != null && (this.activeRoom.state == "connected" || this.activeRoom.state == "reconnecting" || this.activeRoom.state == "reconnected");
    if(connected) this.activeRoom.disconnect();  
    await this.roomService.disconnect(this.roomObj, this.phoneNumber);
    this.joined = false 
    this.activeRoom.localParticipant.unpublishTrack(this.videoTrack)
    this.activeRoom.localParticipant.unpublishTrack(this.audioTrack)
    this.videoTrack.stop()
    this.audioTrack.stop()
    console.log('camera light should be off now')
    this.finalizePreview();
    if(this.isHost) {
        delete this.invitationService.invitations
        this.invitationService.invitations = []
        // this.router.navigate(['/video-call-complete', this.roomObj.RoomSid, 'host', this.phoneNumber])
        console.log('HEADSUP-97')
        window.location.href = `/video-call-complete/${this.roomObj.RoomSid}/host/${this.phoneNumber}`
    }
  }


  //////////////////////////////////////////////
  // moved to video-call-complete.component.ts
  //
  // async compose() { ... }


  /**
   * called from   join_call()
   */
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
        this.renderer.setStyle(videoElement, this.dimension.type, this.dimension.value);
        // this.renderer.setStyle(videoElement, 'display', 'table-cell');
        // this.renderer.setStyle(videoElement, 'vertical-align', 'middle');
        //this.renderer.appendChild(this.previewElement.nativeElement, videoElement);   // <=== OLD WAY

        
        this.renderer.appendChild(this.videoCellsRef.nativeElement, videoElement);    // <=== NEW WAY


        console.log('initializeDevice(): -----------------------------')
        console.log('initializeDevice(): this.renderer = ', this.renderer)
        console.log('initializeDevice(): videoElement = ', videoElement)
    } finally {
        this.isInitializing = false;
        this.showTestPattern = false
    }
  }



  finalizePreview() {
    try {
        this.showTestPattern = true
        if (this.videoTrack) {
            this.videoTrack.detach().forEach(element => {
                // this.renderer.setStyle(this.videoCellsRef.nativeElement, "-webkit-background-size", "contain");
                // this.renderer.setStyle(this.videoCellsRef.nativeElement, "-moz-background-size", "contain");
                // this.renderer.setStyle(this.videoCellsRef.nativeElement, "-o-background-size", "contain");
                // this.renderer.setStyle(this.videoCellsRef.nativeElement, "min-height", "25vh");
                // this.renderer.setStyle(this.videoCellsRef.nativeElement, "min-width", "100vw");
                // this.renderer.setStyle(this.videoCellsRef.nativeElement, 'background', "url('assets/test_pattern.png') no-repeat center contain;");
                element.remove()
              }
            );
        }
    } catch (e) {
        console.error(e);
    }
  }


  
  /**
   * called from   initializeDevice()
   */
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



  /**
   * 
   * @param track is either a RemoteAudioTrack or a RemoteVideoTrack
   */
  private attachRemoteTrack(track: RemoteTrack) {
    if (this.isAttachable(track)) {
        // this method is called twice for a participant
        // When track is RemoteAudioTrack, element is an <audio> element
        // When track is RemoteVideoTrack, element is an <video> element
        const element = track.attach();
        this.renderer.data.id = track.sid;       
        this.renderer.setStyle(element, this.dimension.type, this.dimension.value);
        // this.renderer.setStyle(element, 'margin', 'auto');
        /**
         * this.listRef.nativeElement - the parent <div #list></div> tag
         * element - either <audio> or <video> tag
         * 
         * .appendChild() adds the <audio> or <video> tag as a child node to the parent <div> tag
         */
        //this.renderer.appendChild(this.listRef.nativeElement, element);     // <=== OLD WAY


        console.log('attachRemoteTrack(): ----------------------------')      
        console.log('attachRemoteTrack(): typeof track = ', (typeof track))
        // if(typeof track == RemoteVideoTrack) {
        //     console.log('attachRemoteTrack(): RemoteVideoTrack')
            // let div = this.renderer.createElement('div'); 
            // this.renderer.addClass(div, 'col')
            this.renderer.appendChild(this.videoCellsRef.nativeElement, element);     // <=== NEW WAY
            // this.renderer.appendChild(div.nativeElement, element);
        // }
        // else {
        //     console.log('attachRemoteTrack(): RemoteAudioTrack - hidden')
        //     // just add the <audio> tag as child of videoCellsRef tag
        //     this.renderer.appendChild(this.videoCellsRef.nativeElement, element);
        // }

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
            // console.log('detachRemoteTrack():  el = ', el)
            // console.log('detachRemoteTrack():  el.parentNode = ', el.parentNode)
            // console.log('detachRemoteTrack():  el.parentNode.parentNode = ', el.parentNode.parentNode)

            // the RemoteAUDIOTrack doesn't have the same parent as the video track, so only remove the parent
            // when the track is a RemoteVideoTrack.  The parent of the RemoteVideoTrack is the <div class="col"> that contains the remote <video> tag 
            
            // LET'S SEE IF WE CAN JUST NOT
            // if(typeof track == RemoteVideoTrack) {
            //     el.parentNode.remove()
            // }
            el.remove() // makes the video square literally go away
            //this.renderer.setStyle(el, 'background-color', '#000000');
        })
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
    this.messageService.updateRecordingStatus("recording")
    this.roomObj['mark_time'] = []
    let now = new Date().getTime()
    // You want created_ms NOT host_joined_ms - if host isn't the first to join, then mark_time.start_recording will be off
    // You will end up capturing footage PRIOR to the segment you actually wanted to record.
    let diff = this.getTimeDiff({first: this.roomObj.created_ms, second: now })
    let timeElem = this.getTimeElement(this.roomObj, now, diff)
    this.roomObj['mark_time'].push(timeElem)
    this.setRecordingState()
  } 


  private getTimeElement(roomObj: RoomObj, now: number, diff: string) {
      let timeElement = {"start_recording_ms": now, "start_recording": diff}
      if(!roomObj.guests) return timeElement
      if(roomObj.guests.length == 0) return timeElement
      // https://headsupvideo.atlassian.net/browse/HEADSUP-105
      // design note: host should not click record until the guest has joined
      let guestDiff = this.getTimeDiff({first: roomObj.guests[0]['joined_ms'], second: now })
      timeElement['start_recording_guest'] = guestDiff
      return timeElement
  }


  start_recording3() {
      let alreadyRecordedSomething = this.roomObj['mark_time'] && this.roomObj['mark_time'].length > 0
      if(alreadyRecordedSomething) {
          this.confirmRerecord(this.start_recording.bind(this))
      }
      else this.start_recording()
  } 

  stop_recording() {
    this.roomObj['recording_state'] = ""
    this.messageService.updateRecordingStatus("stopped")
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
    this.messageService.updateRecordingStatus("paused")
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
    this.messageService.updateRecordingStatus("recording")
    let now = new Date().getTime()
    // You want created_ms NOT host_joined_ms - if host isn't the first to join, then mark_time.start_recording will be off
    // You will end up capturing footage PRIOR to the segment you actually wanted to record.
    let diff = this.getTimeDiff({first: this.roomObj.created_ms, second: now})
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


  addSomeone() {
      this.messageService.setCurrentInvitations(this.invitations)
      this.translated = true
  }


  /**
   * teams.component.ts : onTeamSelected() 
   */
  onInvitationsSent(invitation: Invitation) {
      console.log('onInvitationsSent(): invitation = ', invitation)
      this.invitations.push(invitation)
      this.messageService.setCurrentInvitations(this.invitations)
      this.monitorInvitation(invitation)
      this.translated = false // moves the form back down, out of sight
  }
  

  /**
    remoteParticipant.on('trackDisabled', track => {
      // hide or remove the media element related to this track
    }); 



    remoteParticipant.on('trackEnabled', track => {
      // show the track again
    });


   */

  guestClicked(invitation: Invitation) {  
      this.videoGuestEditorComponent.setInvitation(invitation)
      // this.selectedInvitation = invitation   
      this.translatedGuest = true
  }


  async confirmRerecord(fnStartRecording) {
    
    var modalRef = this.showOkCancel(fnStartRecording);
    
    modalRef.componentInstance.title = `Erase Recording?`;
    modalRef.componentInstance.question = 'Do you want to record over your last recording?';
    modalRef.componentInstance.thing = '';
    modalRef.componentInstance.warning_you = 'This cannot be undone.';
    modalRef.componentInstance.really_warning_you = 'Are you sure?';

  }


  showOkCancel(callback) {
    const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});
    modalRef.result.then(async (result) => {
      // the ok/delete case
      // this.closeResult = `Closed with: ${result}`;

      // so that we get updated memberCount and leaderCount
      // this.team = await this.teamService.deleteTeamMember(team_member);
      callback();
    }, (reason) => {
      // the cancel/dismiss case
      // this.closeResult = `Dismissed ${reason}`;
    });
    return modalRef;
  }


  /**
   * https://www.twilio.com/docs/video/screen-capture-chrome
   */
  async share_screen(currentlyShared) {
      try {
          this.screenIsShared = !currentlyShared
          let theparent = this.videoCellsRef.nativeElement

          if(this.screenIsShared) { 
          
              if(!this.screenTrack) {
                  const mediaDevices = navigator.mediaDevices as any  // workaround  https://github.com/microsoft/TypeScript/issues/33232
                  this.screenStream = await mediaDevices.getDisplayMedia()
                  this.screenTrack = new LocalVideoTrack(this.screenStream.getTracks()[0])
              }

              /*await? */ this.activeRoom.localParticipant.publishTrack(this.screenTrack)
                
              this.screenElement = this.screenTrack.attach()
              let child = this.screenElement
              this.renderer.setStyle(this.screenElement, this.dimension.type, this.dimension.value) 
              this.renderer.appendChild(theparent, child)
          }
          if(!this.screenIsShared) {
              /*await? */ this.activeRoom.localParticipant.unpublishTrack(this.screenTrack)
              this.screenTrack.detach()
              let child = this.screenElement
              this.renderer.removeChild(theparent, child)
          }
            
      }
      catch(err) {
          console.log('err: ', err)
      }


  }


  onDeletedInvitation(invitation: Invitation) {
      this.translatedGuest = false
      this.delete_guest(invitation)
  }


}
