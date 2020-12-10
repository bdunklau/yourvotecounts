import { Component, OnInit, Input, OnDestroy,PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Team } from '../team/team.model';
import { TeamMember } from '../team/team-member.model';
import { TeamService } from '../team/team.service';
import { Subject/*, Observable*/, Subscription } from 'rxjs';
import { /*map,*/ switchMap } from 'rxjs/operators';
import { NgbdModalConfirmComponent } from '../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';
import * as _ from 'lodash';
import { MessageService } from '../core/message.service';
import { map, take/*, take, switchMap*/ } from 'rxjs/operators';

@Component({
  selector: 'app-team-member-editor',
  templateUrl: './team-member-editor.component.html',
  styleUrls: ['./team-member-editor.component.css'],
  providers: [NgbActiveModal]
})
export class TeamMemberEditorComponent implements OnInit {

  @Input() team: Team;
  /*@Input()*/ team_members: TeamMember[];
  user: FirebaseUserModel;
  private teamMemberSubscription2: Subscription;
  subject = new Subject<any>();
  canAddTeamMembers = false;
  canRemoveTeamMembers = false;
  canSetLeaders = false

  constructor(private teamService: TeamService,
              private userService: UserService,
              @Inject(PLATFORM_ID) private platformId,
              private _modalService: NgbModal,
              private messageService: MessageService) { }

  async ngOnInit() {
      if(isPlatformBrowser(this.platformId)) {

          this.user = await this.userService.getCurrentUser();

          if (this.team && this.team.id) {
            console.log("TeamMemberEditorComponent:  team: ", this.team)
            //this.createForm(this.user.name);
            this.teamMemberSubscription2 = this.teamService.getMembersByTeamId(this.team.id).pipe(
              // take(1),  // this is how you keep the page from updating.  sometimes you want to do this, but not here
              map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as TeamMember;
                  const id = a.payload.doc.id;
                  var returnThis = { id, ...data };
                  // console.log('returnThis = ', returnThis);
                  return returnThis;
                });
              })
            )
              .subscribe(objs => {
                // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
                this.team_members = _.map(objs, obj => {
                  let tm = obj as unknown;
                  return tm as TeamMember;
                });

                // FIXME I'm querying for ALL team members just to see if I am a leader on that team
                // ALSO HAVE 2 DATABASE READS GOING ON IN THE SAME PAGE - ONE IN THIS COMPONENT AND THE OTHER
                // IN team-editor.component.ts THAT'S NOT GOOD
                this.setEditMemberPermissions(this.user, this.team, this.team_members);

                console.log('TeamMemberEditorComponent: team_members: ', this.team_members);
              });
          }
      }
  }

  ngOnDestroy() {
    if(this.teamMemberSubscription2) this.teamMemberSubscription2.unsubscribe();
  }

  checked($event, team_member) {
    // don't toggle the switch position based on the user's click
    // change it based on the value that comes back from the updateMember() call
    $event.preventDefault();
    team_member.leader = $event.srcElement.checked;
    if(this.user.uid === team_member.userId) {
      if(this.team.leaderCount === 1) {
        // don't allow the user to revoke his own leader access because that would make the team leader-less
        // Instead, tell the user that he must first make someone else a leader before revoking his own access.
        var ok2 = function() { /*noop*/ }
        var modalRef = this.showOkCancel(ok2);
        modalRef.componentInstance.title = `Not Allowed`;
        modalRef.componentInstance.question = 'You are not allowed to revoke your own leader access because you are the only leader on this team';
        modalRef.componentInstance.thing = '';
        modalRef.componentInstance.warning_you = 'You must first make someone else a leader before you can revoke your leader access.';
        modalRef.componentInstance.really_warning_you = '';
      }
      else {
        // warn about revoking your own leader role
        var ok = function() {
          this.teamService.updateMember(team_member).then(async () => {
            this.team = await this.teamService.getTeamData(this.team.id);// to get updated leaderCount and memberCount
            console.log('this.team = ', this.team);
          });
        }.bind(this);
        var modalRef = this.showOkCancel(ok);
        modalRef.componentInstance.title = `Revoke Yourself?`;
        modalRef.componentInstance.question = 'Are you sure you want to revoke your own leader access?';
        modalRef.componentInstance.thing = '';
        modalRef.componentInstance.warning_you = 'If you proceed, you will not be able to edit the team or its members.';
        modalRef.componentInstance.really_warning_you = 'Are you sure?';
      }
    }
    else {
      this.teamService.updateMember(team_member).then(async () => {
        this.team = await this.teamService.getTeamData(this.team.id);// to get updated leaderCount and memberCount
        console.log('this.team = ', this.team);
      });
    }
  }

  async confirmDelete(obj) {
    var team_member = new TeamMember(obj);
    // deleting yourself?
    //    are you the last leader?
    //    are you the last member?
    // deleting someone else?
    //    no issues because they can't be the last person or the last leader

    var deletingMyself = this.user.uid === team_member.userId;
    console.log('deletingMyself = user.uid === team_member.userId: ', deletingMyself, ' = ', this.user.uid, '===', team_member.userId);

    // var modalRef = this.showOkCancel(team_member);
    var modalRef = this.showOkCancel(async () => {this.team = await this.teamService.deleteTeamMember(team_member);});

    if(deletingMyself) {
      // am I the last person?...
      if(this.team.memberCount === 1) {
        // special case - tell the user the team is about to be deleted
        modalRef.componentInstance.title = `Remove Yourself?`;
        modalRef.componentInstance.question = 'Are you sure you want to remove yourself?';
        modalRef.componentInstance.thing = '';
        modalRef.componentInstance.warning_you = 'You are the only person on this team.';
        modalRef.componentInstance.really_warning_you = 'Removing yourself will cause the team to be deleted.  This cannot be undone.';
      } else if(this.team.leaderCount === 1) {
        // special case - should not allow the user to delete himself in this case because there would be no more leaders
        modalRef.componentInstance.title = `Remove Yourself?`;
        modalRef.componentInstance.question = 'Are you sure you want to remove yourself?';
        modalRef.componentInstance.thing = '';
        modalRef.componentInstance.warning_you = 'You are the only person on this team that can add new people. If you remove yourself, no one else will be able to manage this team. You should assign another leader first before removing yourself.';
        modalRef.componentInstance.really_warning_you = 'You are advised to Cancel.';
      } else {
        // tell the user he won't be able to get back in on his own
        modalRef.componentInstance.title = `Remove Yourself?`;
        modalRef.componentInstance.question = 'Are you sure you want to remove yourself?';
        modalRef.componentInstance.thing = '';
        modalRef.componentInstance.warning_you = 'If you want to re-join this team, one of the other team members will have to add you back.';
        modalRef.componentInstance.really_warning_you = 'You will not be able to get back in on your own.';
      }
    }
    else {
      modalRef.componentInstance.title = `Remove ${team_member.displayName}?`;
      modalRef.componentInstance.question = 'Are you sure you want to remove ';
      modalRef.componentInstance.thing = team_member.displayName+' ?';
      modalRef.componentInstance.warning_you = 'You can add this person back at any time';
      modalRef.componentInstance.really_warning_you = '';
    }
  }

  onUserSelectedByName(user: FirebaseUserModel) {
    if(!user) return;
    var existing = _.find(this.team_members, {userId: user.uid});
    // console.log("onUserSelectedByName(): user = ", user, ' team_members = ', this.team_members, ' existing = ',existing);
    if(user && !existing) {
      console.log('onUserSelectedByName():  this.team = ', this.team);
      console.log('onUserSelectedByName():  user = ', user);
      this.teamService.addUserToTeam(this.team, user);
    }
  }

  setEditMemberPermissions(user: FirebaseUserModel, team: Team, team_members: TeamMember[]) {
    if(!user || !team || !team_members) return false;
    this.canAddTeamMembers = user.canAddTeamMembers(team, team_members);
    this.canRemoveTeamMembers = user.canRemoveTeamMembers(team, team_members);
    this.canSetLeaders = user.canSetLeaders(team, team_members);
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

}
