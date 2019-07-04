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

@Component({
  selector: 'app-team-member-editor',
  templateUrl: './team-member-editor.component.html',
  styleUrls: ['./team-member-editor.component.css'],
  providers: [NgbActiveModal]
})
export class TeamMemberEditorComponent implements OnInit {

  @Input() team: Team;
  team_members: TeamMember[];
  private subscription: Subscription;

  constructor(private teamService: TeamService,
              private userService: UserService,
              private _modalService: NgbModal) { }

  ngOnInit() {
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
    var user = await this.userService.getCurrentUser();
    var team_name = team_member.team_name;
    const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});
    modalRef.result.then((result) => {
      // the ok/delete case
      // this.closeResult = `Closed with: ${result}`;
      this.teamService.deleteTeamMember(team_member);
    }, (reason) => {
      // the cancel/dismiss case
      // this.closeResult = `Dismissed ${reason}`;
    });

    if(user.uid === team_member.userId) {
      modalRef.componentInstance.title = `Remove Yourself?`;
      modalRef.componentInstance.question = 'Are you sure you want to remove yourself';
      modalRef.componentInstance.thing = '';
      modalRef.componentInstance.warning_you = 'You will not be able to add yourself back to this team';
      modalRef.componentInstance.really_warning_you = 'Someone else will have to add you back';
    } else {
      modalRef.componentInstance.title = `Remove ${team_member.displayName}?`;
      modalRef.componentInstance.question = 'Are you sure you want to remove ';
      modalRef.componentInstance.thing = team_member.displayName;
      modalRef.componentInstance.warning_you = 'You can add this person at any time';
      modalRef.componentInstance.really_warning_you = '';
    }
  }

  onUserSelectedByName(user: FirebaseUserModel) {
    console.log("onUserSelectedByName(): user = ", user);
    this.teamService.addUserToTeam(this.team, user);
  }

}
