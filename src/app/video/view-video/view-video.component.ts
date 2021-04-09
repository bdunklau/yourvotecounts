import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { RoomObj } from '../../room/room-obj.model'
import { RoomService } from '../../room/room.service';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from '../../user/user.model';
import * as _ from 'lodash'
import { Official } from '../../civic/officials/view-official/view-official.component'
import { isPlatformBrowser } from '@angular/common';
import { MessageService } from '../../core/message.service';
import {
    OnExecuteData,
    OnExecuteErrorData,
    ReCaptchaV3Service,
  } from "ng-recaptcha";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingsService } from 'src/app/settings/settings.service';
import { Settings } from '../../settings/settings.model';
import { NgbdModalConfirmComponent } from '../../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Clipboard } from '@angular/cdk/clipboard'


@Component({
  selector: 'app-view-video',
  templateUrl: './view-video.component.html',
  styleUrls: ['./view-video.component.css']
})
export class ViewVideoComponent implements OnInit {

    //composition:any
    //url: string
    private routeSubscription: Subscription;
    //compositionSid: string
    //storageName: string
    videoUrl:string
    videoType:string
    room:RoomObj
    browser:string
    video_title:string
    video_description:string
    editing_title = false
    editing_description = false
    editing_allowed = false // if logged in and host or guest of video
    //collapsed = false
    translated = false
    committeeDialogTranslated = false
    private official_selected_sub: Subscription
    private official_deleted_sub: Subscription
    private committee_selected_sub: Subscription
    isHost = false
    isGuest = false
    initialized = false
    showAd = false
    private userSubscription: Subscription;
    officialsCollapsed = true
    showElectedOfficials = false
    showComments = true
    settingsDoc: Settings
    confirmed_human = false
    confirmed_robot = false
    need_to_check = false
    HUMAN_ROBOT_THRESHOLD = 0.41  // 0 < robot < 0.4 < human < 1.0
    emailAddresses: string
    salutation: string
    currentUrl: string


    constructor(private roomService: RoomService,
                private userService: UserService,
                private _modalService: NgbModal,
                private clipboard: Clipboard,
                private recaptchaV3Service: ReCaptchaV3Service,
                private settingsService: SettingsService,
                private http: HttpClient,
                private messageService: MessageService,
                @Inject(PLATFORM_ID) private platformId,
                //private _modalService: NgbModal,
                private route: ActivatedRoute) {
                    

            var nxt = function(user /* FirebaseUserModel */) {     
                let allowed = this.allowedToEdit(user)
                if(allowed) {
                    this.editing_allowed = true
                }
                this.listenForOfficials()
                this.isHost = this.room && this.room.isHost(user)
                this.isGuest = this.room && this.room.isGuest(user)
            }.bind(this);

            this.userSubscription = this.messageService.listenForUser().subscribe({
                next: nxt,
                error: function(value) {
                },
                complete: function() {
                }
            })
    }


    async ngOnInit() {

        try {
            this.room = this.roomService.roomObj
            this.videoUrl = this.room.videoUrl
        } catch(err) { 
            /**
             * server console was spitting out a mile of stack crap because the room object wasn't available right here.
             * I tried moving the 2 lines above down inside the if(isBrowser) block - for some reason that caused the video
             * to not be play-able.  So I moved this code back up here but wrapped in a try/catch because the giant error was just
             * annoying and served no purpose
             */
            console.log('better error? :)') 
        }


        console.log('isPlatformBrowser(this.platformId)...')
        let isBrowser = isPlatformBrowser(this.platformId)
        console.log('isPlatformBrowser(this.platformId) = ', isBrowser)
        
        if(isBrowser) {

            // is there an 'ad' parameter?  If so, show the banner ad - doesn't matter what the value of the parameter is
            if(this.route.snapshot.queryParams.ad) {
                this.showAd = true
            }

            let safari = function() {
                // Detect Safari
                let safariAgent = window.navigator.userAgent.indexOf("Safari") > -1
                // Detect Chrome 
                let chromeAgent = window.navigator.userAgent.indexOf("Chrome") > -1
                if(!safariAgent) return false
                // Discard Safari since it also matches Chrome 
                if ((chromeAgent) && (safariAgent)) return false
                else return true
            }

            // this.browser = window.navigator.userAgent
            if(safari()) {
                this.videoUrl = this.room.videoUrl
                this.videoType = "application/x-mpegURL"
            }
            else {
                this.videoUrl = this.room.videoUrlAlt
                this.videoType = "video/mp4"
            }
            if(this.room.video_title) this.video_title = this.room.video_title
            if(this.room.video_description) this.video_description = this.room.video_description
            this.initialized = true


            ///////////////////////////////////////////////////////////////////////////////////////
            // for reCAPTCHA v3  
            let user = await this.userService.getCurrentUser()
            if(user) {
                this.confirmed_human = true
            }
            else {
                this.confirmed_human = false
                this.settingsDoc = await this.settingsService.getSettingsDoc();
            }
            this.need_to_check = !this.confirmed_human && !this.confirmed_robot
            console.log('ngOnInit():  confirmed_human = ', this.confirmed_human)
            ///////////////////////////////////////////////////////////////////////////////////////

            
            this.emailAddresses = this.refigureEmailAddresses()
            this.salutation = this.refigureSalutation()            
            this.currentUrl = window.location.href


        }
        console.log('ngOnInit():  done')

    }


    ngOnDestroy() {
        if(this.official_selected_sub) this.official_selected_sub.unsubscribe();
        if(this.official_deleted_sub) this.official_deleted_sub.unsubscribe();
        if(this.committee_selected_sub) this.committee_selected_sub.unsubscribe();
        if(this.userSubscription) this.userSubscription.unsubscribe();
        ///////////////////////////////////////////////////////////////////////////////////////
        // reCAPTCHA v3  
        if (this.singleExecutionSubscription) {
            this.singleExecutionSubscription.unsubscribe();
        }
        ///////////////////////////////////////////////////////////////////////////////////////
    }
    
    async ngAfterViewInit() {
        console.log('ngAfterViewInit():  done')
    }


    save_title() {
        this.roomService.saveVideoTitle(this.room.RoomSid, this.video_title)
        this.editing_title = false
    }


    save_description() {
        this.roomService.saveVideoDescription(this.room.RoomSid, this.video_description)
        this.editing_description = false
    }


    allowedToEdit(user: FirebaseUserModel): boolean {
        if(!user) return false
        if(user['phoneNumber'] === this.room.hostPhone) {
            return true
        }
        else {
            return false
        }
    }


    beginEditTitle() {
        if(!this.editing_allowed)
            return // ignore user touch/click
        this.editing_title = true
    }


    beginEditDescription() {
        if(!this.editing_allowed)
            return // ignore user touch/click
        this.editing_description = true
    }


    // opens a modal to /search-officials
    openOfficialDialog() {
        // this.showOkCancel(function() {console.log('callback called')})
        this.translated = true
    }


    openCommitteeDialog() {
        this.committeeDialogTranslated = true
    }


    /**
     * get all FB handles and the window.location.href and copy that to clipboard
     * Pop up modal saying this stuff has been copied to the clipboard and can how be pasted into FB
     */
    facebookTagAll() { 
        let thePost = this.createSocialMediaPost('Facebook')

        let toClipboard = function() {
            // ref:   ngbd-modal-confirm.component.ts:copyContent()
            this.clipboard.copy(thePost)
        }.bind(this)

        var modalRef = this.showOkDialog(toClipboard);
        modalRef.componentInstance.title = 'Copied!';
        modalRef.componentInstance.question = '';
        modalRef.componentInstance.thing = 'A Facebook post has been copied to your clipboard.  Go to Facebook and paste - that\'s it!';
        modalRef.componentInstance.warning_you = '';
        modalRef.componentInstance.really_warning_you = '';
        modalRef.componentInstance.confirmText = 'OK';
    }

    twitterTagAll() { 
        let thePost = this.createSocialMediaPost('Twitter')

        let toClipboard = function() {
            // ref:   ngbd-modal-confirm.component.ts:copyContent()
            this.clipboard.copy(thePost)
        }.bind(this)

        var modalRef = this.showOkDialog(toClipboard);
        modalRef.componentInstance.title = 'Copied!';
        modalRef.componentInstance.question = '';
        modalRef.componentInstance.thing = 'A Twitter post has been copied to your clipboard.  Go to Twitter and paste - that\'s it!';
        modalRef.componentInstance.warning_you = '';
        modalRef.componentInstance.really_warning_you = '';
        modalRef.componentInstance.confirmText = 'OK';
    }

    createSocialMediaPost(postType /* FB or Twitter */) {
        let unflattened = _.map(this.room.officials, (official:Official) => official.channels)
        let allChannels = _.flatten(unflattened)
        let allOneType = _.filter(allChannels, {type: postType})
        let allHandlesOfAType = _.map(allOneType, aChannel => { 
            if(!aChannel.id.startsWith('@')) return '@'+aChannel.id
            else return aChannel.id
        })
        let joined = _.join(allHandlesOfAType, " ")
        let thePost = joined+'\n\n'+window.location.href
        return thePost
    }

    showOkDialog(callback) {
        //  ngbd-modal-confirm.component.ts
        //  ngbd-modal-confirm.component.html
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


    refigureEmailAddresses() {
        let unflattedEmails = _.map(this.room.officials, (official:Official) => official.emails)
        let theseEmails = _.flatten(unflattedEmails)
        return _.join(theseEmails, ",") // most clients expect commas. MSOutlook wants ;'s
    }

    refigureSalutation() {
        let names = _.map(this.room.officials, (official:Official) => "the Honorable "+official.name)
        return "To " + _.join(names, ", ") + ","
    }

    
    private listenForOfficials() {
        
        let alreadyListening = this.official_selected_sub && !this.official_selected_sub.closed
        if(alreadyListening) {
            return
        }

        let self = this;
  
        let isBrowser = isPlatformBrowser(this.platformId)
        
        if(isBrowser) {
            this.official_selected_sub = this.roomService.official_selected.subscribe({
                next: function(official:Official) {
                    if(!self.room.officials) self.room.officials = []
                    self.room.officials.push(official)
                    self.roomService.setOfficials(self.room)
                    self.emailAddresses = self.refigureEmailAddresses()
                    self.salutation = self.refigureSalutation()
                    //console.log('self.room.officials = ', self.room.officials)
                    // now close the search-officials.component.ts slide up footer
                    self.translated = false
                },
                error: function(value) {
                },
                complete: function() {
                }
            }); 


            this.official_deleted_sub = this.roomService.official_deleted.subscribe({
                next: function(official:Official) {
                    _.remove(self.room.officials, (off:Official) => {
                        return off.name === official.name
                    })
                    self.roomService.setOfficials(self.room)
                    //console.log('self.room.officials = ', self.room.officials)
                },
                error: function(value) {
                },
                complete: function() {
                }
            })

            
            /**
             * HEADSUP-76
             */
            let setCommittee = function(committee) { 
                // this.selectedCommittee = committee
                if(!self.room.officials) self.room.officials = []
                _.each(committee.officials, official => {
                    self.room.officials.push(official)
                })
                self.roomService.setOfficials(self.room)
                self.committeeDialogTranslated = false
            }.bind(this)

            this.committee_selected_sub = this.messageService.listenForCommitteeSelection().subscribe({
                next: setCommittee,
                error: () => {}, 
                complete: () => {}
            })
        }
    }



    ///////////////////////////////////////////////////////////////////////////////////////
    // reCAPTCHA v3    
    private singleExecutionSubscription: Subscription;
    

    public executeAction(action: string): void {
        if (this.singleExecutionSubscription) {
            this.singleExecutionSubscription.unsubscribe();
        }
        this.singleExecutionSubscription = this.recaptchaV3Service
        .execute(action)
        .subscribe(
            async (token) => {
                const options = {
                    headers: new HttpHeaders({
                      //'Content-Type':  'application/json',
                      // 'Authorization': 'my-auth-token',
                      // 'Access-Control-Allow-Origin': '*'
                    })
                };

                let url = `https://${this.settingsDoc.firebase_functions_host}/verifyCaptcha?recaptcha_v3_token=${token}`
                console.log('about to get')
                let get = this.http.get(`https://${this.settingsDoc.firebase_functions_host}/verifyCaptcha?recaptcha_v3_token=${token}`, options)
                console.log('get: done')
                let resp:any = await get.toPromise()
                console.log('xxxx resp = ', resp)

                let score = parseFloat(resp.score)
                console.log('xxxx score = ', score)
                if(score >= this.HUMAN_ROBOT_THRESHOLD) {
                    this.confirmed_human = true
                    this.confirmed_robot = false
                    this.need_to_check = false
                }
                else {
                    this.confirmed_human = false
                    this.confirmed_robot = true
                    this.need_to_check = false
                }

            },
            (error) => {
                this.confirmed_human = false
                this.confirmed_robot = false
                this.need_to_check = true
            }
        );
    }
    ///////////////////////////////////////////////////////////////////////////////////////

}
