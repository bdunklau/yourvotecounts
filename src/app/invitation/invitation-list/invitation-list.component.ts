import { Component, OnInit, Input, /* Output, EventEmitter */ PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Invitation } from '../invitation.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from '../../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { InvitationService } from '../invitation.service';
import { Subscription } from 'rxjs';
import { map /*, take */ } from 'rxjs/operators';
import { FirebaseUserModel } from '../../user/user.model';
import * as _ from 'lodash';
import { UserService } from '../../user/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.css']
})
export class InvitationListComponent implements OnInit {

  /*@Input()*/ me: FirebaseUserModel;
  invitations: Invitation[];
  private subscription: Subscription;
  

  constructor(
    private userService: UserService,
    private invitationService: InvitationService,
    @Inject(PLATFORM_ID) private platformId,
    private _modalService: NgbModal,
    private router: Router,) { }

  async ngOnInit(): Promise<void> {
    this.invitations = [];
    if(isPlatformBrowser(this.platformId)) {

        this.me = await this.userService.getCurrentUser();
        this.subscription = this.invitationService.getInvitationsForUser(this.me.uid).pipe(
          map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data() as Invitation;
              const id = a.payload.doc['id'];
              var returnThis = { id, ...data };
              // console.log('returnThis = ', returnThis);
              return returnThis;
            });
          })
        )
          .subscribe(objs => {
            // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
            this.invitations = _.map(objs, obj => {
              let invitation = obj as unknown;
              return invitation as Invitation;
            })
          });
    }
  }


  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
  }


  async confirmDelete(obj) {
    var invitation = obj
    
    var modalRef = this.showOkCancel(async () => { /*await*/ this.invitationService.deleteInvitation(invitation);});
    
    modalRef.componentInstance.title = `Cancel Invitation`;
    modalRef.componentInstance.question = 'Do you want to cancel this invitation to ';
    modalRef.componentInstance.thing = invitation.displayName+' ?';
    modalRef.componentInstance.warning_you = '';
    modalRef.componentInstance.really_warning_you = '';

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

  invitationDetails(invitation: Invitation) {
      this.router.navigate(['/video-call', invitation.invitationId, this.me.phoneNumber])
  }

}
