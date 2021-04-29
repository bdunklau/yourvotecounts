import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Invitation } from '../../invitation/invitation.model';


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


    constructor() { }

    ngOnInit(): void {
    }


    setInvitation(invitation: Invitation) {
        this.editingInvitation = invitation
    }


    deleteInvitation(invitation: Invitation) {
        if(this.confirmDelete) {
            this.outputDeletedInvitation.emit(invitation)
        }
        this.confirmDelete = !this.confirmDelete
    }

}
