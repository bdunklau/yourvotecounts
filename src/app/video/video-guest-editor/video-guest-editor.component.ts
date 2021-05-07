import { Component, OnInit, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { Invitation } from '../../invitation/invitation.model';
import { InvitationService } from '../../invitation/invitation.service';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.model';
import { isPlatformBrowser } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard'


/**
 * ng g c video/video-guest-editor --module=app
 */
@Component({
  selector: 'app-video-guest-editor',
  templateUrl: './video-guest-editor.component.html',
  styleUrls: ['./video-guest-editor.component.css']
})
export class VideoGuestEditorComponent implements OnInit {

    editingInvitation: Invitation
    @Output() outputDeletedInvitation = new EventEmitter<Invitation>()
    confirmDelete = false
    addingEmail = false
    editingEmail = false
    sendingEmail = false
    settings: Settings
    url: string
    email: string


    constructor(private invitationService: InvitationService,
                @Inject(PLATFORM_ID) private platformId,
                private clipboard: Clipboard,
                private settingsService: SettingsService) { }

    async ngOnInit() {        
        if (isPlatformBrowser(this.platformId)) {
            this.settings = await this.settingsService.getSettingsDoc()
        }
    }


    setInvitation(invitation: Invitation) {
        this.editingInvitation = invitation         
        this.url = `https://${window.location.host}/video-call/${this.editingInvitation.invitationId}/${this.editingInvitation.phoneNumber}`
        let msg = `${this.editingInvitation.creatorName} is inviting you to participate in a video call on HeadsUp.  Click the link below to see this invitation. \n\nDo not reply to this text message.  This number is not being monitored. \n\n${this.url}`
        this.editingInvitation.message = msg
    }


    deleteInvitation(invitation: Invitation) {
        if(this.confirmDelete) {
            this.outputDeletedInvitation.emit(invitation)
        }
        this.confirmDelete = !this.confirmDelete
    }


    async save_email() {
        this.editingInvitation.email = this.email
        await this.invitationService.updateEmail(this.editingInvitation)
        this.editingEmail = false
    }


    async sendEmail(invitation: Invitation) {
        this.sendingEmail = true      
        // let url = `https://${window.location.host}/video-call/${invitation.invitationId}/${invitation.phoneNumber}`
        // let msg = `${invitation.creatorName} is inviting you to participate in a video call on HeadsUp.  Click the link below to see this invitation. \n\nDo not reply to this text message.  This number is not being monitored. \n\n${url}`
        // invitation.message = msg
        await this.invitationService.emailInvitation(invitation, this.settings)
        this.sendingEmail = false
    }


    copyUrl(url: string) {      
        this.clipboard.copy(url)
    }


    editEmail() {
        this.editingEmail = !this.editingEmail
        this.email = this.editingInvitation.email
    }

}
