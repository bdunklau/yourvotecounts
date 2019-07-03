import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { ActivatedRoute/*, CanActivate, RouterStateSnapshot, Router*/ } from '@angular/router';
import { TeamService } from '../team/team.service';
import { Team } from '../team/team.model';
import { TeamMember } from '../team/team-member.model';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { NgbdModalConfirmComponent } from '../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  teams: TeamMember[];
  private subscription: Subscription;

  constructor(private route: ActivatedRoute,
              private teamService: TeamService,
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
        this.teams = _.map(objs, obj => new TeamMember(obj))
        // _.each(obj, xx => {
        //   console.log(xx.payload.doc.id, ' : ', xx.payload.doc.data());
        // })
      });
  }

  // always unsubscribe
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  edit(team: Team) {
    this.selectedTeam.emit(team);
  }

  closeResult: string;
  confirmDelete(team: Team) {
    var team_name = team.name;
    const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${reason}`;
    });

    modalRef.componentInstance.title = 'Delete Team?';
    modalRef.componentInstance.question = 'Are you sure you want to delete the team ';
    modalRef.componentInstance.thing = team_name;
    modalRef.componentInstance.warning_you = 'All information associated to this team will be permanently deleted.';
    modalRef.componentInstance.really_warning_you = 'This operation can not be undone.';
  }

}
