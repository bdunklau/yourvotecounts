import { Component, OnInit } from '@angular/core';
import { NgbActiveModal/*, NgbModal*/ } from '@ng-bootstrap/ng-bootstrap';
import { Clipboard } from '@angular/cdk/clipboard'


@Component({
  selector: 'app-ngbd-modal-confirm',
  templateUrl: './ngbd-modal-confirm.component.html',
  styleUrls: ['./ngbd-modal-confirm.component.css']
})
export class NgbdModalConfirmComponent implements OnInit {

    // If these had been objects, we would have needed @Input in front of each
    title: string;
    question: string;
    thing: string;
    warning_you: string;
    really_warning_you: string;
    showCancelButton = true
    danger = true // drives color of OK button on ngbd-modal-confirm.component.html
    confirmText = 'OK' // default text for the confirm button, but changeable

    // constructor(public modal: NgbActiveModal) {}
    constructor(public modal: NgbActiveModal,
                private clipboard: Clipboard) {}

    ngOnInit() {
    }


    /**
     * NOTE - copies ALL THE TIME even when it makes no sense (like when the button is a simple OK button)
     * But in that case, who cares really - you're following up with a Ctrl-V.  The user will probably never know
     * they've copied random info to their clipboard
     */
    copyContent() {
        // https://material.angular.io/cdk/clipboard/overview#click-an-element-to-copy
        this.clipboard.copy(this.title+'\n\n'+this.thing)
    }

}
