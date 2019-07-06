import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Team } from '../team/team.model';
import { TeamMember } from '../team/team-member.model';
import { TeamService } from '../team/team.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbdModalConfirmComponent } from '../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-team-member-editor',
  templateUrl: './team-member-editor.component.html',
  styleUrls: ['./team-member-editor.component.css'],
  providers: [NgbActiveModal]
})
export class TeamMemberEditorComponent implements OnInit {

  @Input() team: Team;
  team_members: TeamMember[];
  user: FirebaseUserModel;
  private subscription: Subscription;

  constructor(private teamService: TeamService,
              private userService: UserService,
              private _modalService: NgbModal) { }

  async ngOnInit() {
    this.user = await this.userService.getCurrentUser();
    this.subscription = this.teamService.getMembers(this.team).pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as TeamMember;
          return data;
          // const id = a.payload.doc.id;
          // var returnThis = { id, ...data };
          // return returnThis;
        });
      })
    )
    .subscribe(objs => {
      this.team_members = objs;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async confirmDelete(team_member: TeamMember) {
    // deleting yourself?
    //    are you the last leader?
    //    are you the last member?
    // deleting someone else?
    //    no issues because they can't be the last person or the last leader

    var deletingMyself = this.user.uid === team_member.userId;
    console.log('deletingMyself = user.uid === team_member.userId: ', deletingMyself, ' = ', this.user.uid, '===', team_member.userId);
    if(deletingMyself) {
      var modalRef = this.showDeleteModal(team_member);

      // am I the last person?...
      if(this.team.memberCount === 1) {
        // special case - tell the user the team is about to be deleted
        modalRef.componentInstance.title = `Remove Yourself?`;
        modalRef.componentInstance.question = 'Are you sure you want to remove yourself';
        modalRef.componentInstance.thing = '';
        modalRef.componentInstance.warning_you = 'You are the only person on this team.';
        modalRef.componentInstance.really_warning_you = 'Removing yourself will cause the team to be deleted.  This cannot be undone.';
      } else if(this.team.leaderCount === 1) {
        // special case - should not allow the user to delete himself in this case because there would be no more leaders
        modalRef.componentInstance.title = `Remove Yourself?`;
        modalRef.componentInstance.question = 'Are you sure you want to remove yourself';
        modalRef.componentInstance.thing = '';
        modalRef.componentInstance.warning_you = 'You are the only person on this team that can add new people. If you remove yourself, no one else will be able to manage this team. You should assign another leader first before removing yourself.';
        modalRef.componentInstance.really_warning_you = 'You are advised to Cancel.';
      } else {
        // tell the user he won't be able to get back in on his own
        modalRef.componentInstance.title = `Remove Yourself?`;
        modalRef.componentInstance.question = 'Are you sure you want to remove yourself';
        modalRef.componentInstance.thing = '';
        modalRef.componentInstance.warning_you = 'If you want to re-join this team, one of the other team members will have to add you back.';
        modalRef.componentInstance.really_warning_you = 'You will not be able to get back in on your own.';
      }
    }
    else {
      var modalRef = this.showDeleteModal(team_member);

      modalRef.componentInstance.title = `Remove ${team_member.displayName}?`;
      modalRef.componentInstance.question = 'Are you sure you want to remove ';
      modalRef.componentInstance.thing = team_member.displayName;
      modalRef.componentInstance.warning_you = 'You can add this person at any time';
      modalRef.componentInstance.really_warning_you = '';
    }
  }

  onUserSelectedByName(user: FirebaseUserModel) {
    if(!user) return;
    var existing = _.find(this.team_members, {userId: user.uid});
    // console.log("onUserSelectedByName(): user = ", user, ' team_members = ', this.team_members, ' existing = ',existing);
    if(user && !existing)
      this.teamService.addUserToTeam(this.team, user);
  }

  showDeleteModal(team_member: TeamMember) {
    const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});
    modalRef.result.then(async (result) => {
      // the ok/delete case
      // this.closeResult = `Closed with: ${result}`;

      // so that we get updated memberCount and leaderCount
      this.team = await this.teamService.deleteTeamMember(team_member);
    }, (reason) => {
      // the cancel/dismiss case
      // this.closeResult = `Dismissed ${reason}`;
    });
    return modalRef;
  }

}
