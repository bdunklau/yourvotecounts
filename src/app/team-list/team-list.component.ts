import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { ActivatedRoute/*, CanActivate, RouterStateSnapshot, Router*/ } from '@angular/router';
import { TeamService } from '../team/team.service';
import { Team } from '../team/team.model';
import { TeamMember } from '../team/team-member.model';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { map, take } from 'rxjs/operators';
import { NgbdModalConfirmComponent } from '../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../core/message.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css'],
  providers: [NgbActiveModal]
})
export class TeamListComponent implements OnInit {

  @Input() teamListUser: FirebaseUserModel;
  @Output() selectedTeam = new EventEmitter<Team>();
  phoneVal: string;
  teams: Team[];
  private subscription: Subscription;
  private memberSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private teamService: TeamService,
              private messageService: MessageService,
              private _modalService: NgbModal) { }

  ngOnInit() {
    this.teams = [];
    // query team_member where userId = user.uid

    this.subscription = this.teamService.getTeamsForUser(this.teamListUser.uid).pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as TeamMember;
          const id = a.payload.doc.id;
          var returnThis = { id, ...data };
          console.log('returnThis = ', returnThis);
          return returnThis;
        });
      })
    )
      .subscribe(objs => {
        console.log(objs);
        this.teams = _.map(objs, obj => {
          let team = new Team();
          team.id = obj.teamDocId;
          team.name = obj.team_name;
          return team;
        })
      });
  }

  // always unsubscribe
  ngOnDestroy() {
    this.subscription.unsubscribe();
    if(this.memberSubscription) this.memberSubscription.unsubscribe();
  }

  async edit(notFullyPopulated: Team) {
    console.log('notFullyPopulated = ', notFullyPopulated);
    let fullyPopulatedTeam = await this.teamService.getTeamData(notFullyPopulated.id);
    // console.log('team: ', fullyPopulatedTeam);

    this.selectedTeam.emit(fullyPopulatedTeam); // TODO get rid of this and use MessageService in  teams.component and team-member-editor.component


    // FIXME - I think instead we want to do this as soon as the team is created
    if(this.memberSubscription) this.memberSubscription.unsubscribe();
    console.log('fullyPopulatedTeam = ', fullyPopulatedTeam);
    this.memberSubscription = this.teamService.getMembers(fullyPopulatedTeam as Team).pipe(
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
    .subscribe(team_members => {
      console.log('team_members = ', team_members);
      this.messageService.updateTeamMembers(team_members);
    });

  }

  closeResult: string;
  confirmDelete(team: Team) {
    var team_name = team.name;
    const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});
    modalRef.result.then((result) => {
      // the ok/delete case
      // this.closeResult = `Closed with: ${result}`;
      this.teamService.deleteTeam(team);
    }, (reason) => {
      // the cancel/dismiss case
      // this.closeResult = `Dismissed ${reason}`;
    });

    modalRef.componentInstance.title = 'Delete Team?';
    modalRef.componentInstance.question = 'Are you sure you want to delete the team ';
    modalRef.componentInstance.thing = team_name;
    modalRef.componentInstance.warning_you = 'All information associated to this team will be permanently deleted.';
    modalRef.componentInstance.really_warning_you = 'This operation can not be undone.';
  }

}
