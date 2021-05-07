import { Component, ViewChild, OnInit, OnDestroy, HostListener, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Invitation } from '../invitation.model';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { InvitationService } from '../invitation.service';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from '../../user/user.model';
import { Router } from "@angular/router";
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


@Component({
  selector: 'app-invitation-details',
  templateUrl: './invitation-details.component.html',
  styleUrls: ['./invitation-details.component.css']
})
export class InvitationDetailsComponent implements OnInit {

  browserOk:boolean = true
  invitations: Invitation[];
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


  constructor(private route: ActivatedRoute,
              private invitationService: InvitationService,
              private readonly renderer: Renderer2,
              private http: HttpClient,
              private userService: UserService,
              private router: Router) { }

  async ngOnInit() {
    // simpler...  got this from valid-invitation.guard.ts
    this.invitations = this.invitationService.invitations
    this.phoneNumber = this.route.params['phoneNumber']
    this.isHost = this.invitations[0].creatorPhone === this.phoneNumber

    /*******************
    //this.user = await this.userService.getCurrentUser();
    this.routeSubscription = this.route.data.subscribe(routeData => {
      //console.log('routeData = ', routeData);  // type:  plain ol' Object
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

      //console.log('navigator = ', navigator); to see the operation sys, browser type and other stuff
      
    })
    *******************/

  }


  ngOnDestroy() {
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
  }


  
  async join_call() {
    let roomName = this.invitations[0].invitationId;
    this.router.navigate(['/video-call', this.invitations[0].invitationId, this.invitations[0].creatorPhone, 'join'])
  }


}
