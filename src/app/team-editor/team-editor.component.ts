import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Team } from '../team/team.model';
import { TeamService } from '../team/team.service';
import { FirebaseUserModel } from '../user/user.model';
import { TeamMember } from '../team/team-member.model';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { map/*, take*/ } from 'rxjs/operators';
import { MessageService } from '../core/message.service';
import * as _ from 'lodash';
import { Router } from "@angular/router";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from '../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { LogService } from '../log/log.service';

@Component({
  selector: 'app-team-editor',
  templateUrl: './team-editor.component.html',
  styleUrls: ['./team-editor.component.css'],
  providers: [NgbActiveModal/*, FirebaseUserModel*/]
})
export class TeamEditorComponent implements OnInit {

  // editing: boolean;
  team: Team;
  /*@Input()*/ teamNameValue: string;
  /*@Input()*/ teamIdValue: string;
  @Input() user: FirebaseUserModel;
  // @Output() editing = new EventEmitter<boolean>();
  team_members: TeamMember[];
  // teamForm = new FormGroup({
  //   teamId: new FormControl(''),
  //   teamName: new FormControl(''),
  // });
  private routeSubscription: Subscription;
  private memberSubscription: Subscription;

  constructor(private teamService: TeamService,
              private route: ActivatedRoute,
              private router: Router,
              private _modalService: NgbModal,
              private messageService: MessageService,
              private log: LogService) { }

  ngOnInit() {

    this.team = new Team();

    // See TeamResolver and app-routing.module.ts for /teams/edit
    // You'll see that the team object below is created by TeamResolver
    this.routeSubscription = this.route.data.subscribe(routeData => {
      let team = routeData['team'];
      console.log('routeSubscription: team: ', team);
      if (team) {
        this.team = team;
        this.teamIdValue = team.id;
        this.teamNameValue = team.name;
        console.log("team-editor.component.ts  team: ", this.team)
        //this.createForm(this.user.name);
        this.memberSubscription = this.teamService.getMembersByTeamId(team.id).pipe(
          map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data() as TeamMember;
              const id = a.payload.doc['id'];
              var returnThis = { id, ...data };
              return returnThis;
            });
          })
        )
          .subscribe(objs => {
            // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
            this.team_members = _.map(objs, obj => {
              let tm = obj as unknown;
              return tm as TeamMember;
            })
          });
      }

      let user = routeData['user'];
      if(user) {
        this.user = user;
        this.log.i('begin creating team');
      }
    })


  }

  ngOnDestroy() {
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
    if(this.memberSubscription) this.memberSubscription.unsubscribe();
  }

  cancelEditing(form: NgForm) {
    // this.editing.emit(false);
    form.reset();
  }

  deleteTeam(form: NgForm) {
    // this.editing.emit(false);
    this.teamService.deleteTeam(this.team);
    form.reset();
  }

  closeResult: string;
  confirmDelete(form: NgForm, team_member: any /*json of a TeamMember*/) {
    let team: Team = this.toTeam(team_member);
    var team_name = team.name;
    console.log('confirmDelete:  team_member = ', team_member);
    console.log('confirmDelete:  team = ', team);
    const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});
    modalRef.result.then((result) => {
      // the ok/delete case
      // this.closeResult = `Closed with: ${result}`;
      this.teamService.deleteTeam(team);
      form.reset();
      this.router.navigate(['/teams']);
    }, (reason) => {
      // the cancel/dismiss case
      // this.closeResult = `Dismissed ${reason}`;
    });

    modalRef.componentInstance.title = 'Delete Team?';
    modalRef.componentInstance.question = 'Are you sure you want to delete the team ';
    modalRef.componentInstance.thing = team_name+' ?';
    modalRef.componentInstance.warning_you = 'All information associated to this team will be permanently deleted.';
    modalRef.componentInstance.really_warning_you = 'This operation can not be undone.';
  }

  onSubmit(form: NgForm) {
    // this.editing = false;
    // console.log('onSubmit:  this.user = ', this.user);
    var teamId = null;
    if(this.teamIdValue) this.team.id = this.teamIdValue;
    this.team.name = this.teamNameValue.trim();
    if(!this.team.id) {
      teamId = this.teamService.create(this.team);
    }
    else {
      this.teamService.update(this.team);
      teamId = this.team.id;
    }
    this.router.navigate(['/teams', teamId]);
    form.reset();
  }

  private toTeam(obj: any) {
    let team: Team = new Team();
    team.id = obj.id
    team.name = obj.name;
    return team;
  }

}
