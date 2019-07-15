import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Team } from '../team/team.model';
import { TeamService } from '../team/team.service';
import * as firebase from 'firebase/app';
import { FirebaseUserModel } from '../user/user.model';
import { TeamMember } from '../team/team-member.model';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { map/*, take*/ } from 'rxjs/operators';
import { MessageService } from '../core/message.service';

@Component({
  selector: 'app-team-editor',
  templateUrl: './team-editor.component.html',
  styleUrls: ['./team-editor.component.css'],
})
export class TeamEditorComponent implements OnInit {

  // editing: boolean;
  team: Team;
  // @Input() teamNameValue: string;
  // @Input() teamIdValue: string;
  @Input() user: FirebaseUserModel;
  @Output() editing = new EventEmitter<boolean>();
  // teamForm = new FormGroup({
  //   teamId: new FormControl(''),
  //   teamName: new FormControl(''),
  // });
  private routeSubscription: Subscription;
  private memberSubscription: Subscription;

  constructor(private teamService: TeamService,
              private route: ActivatedRoute,
              private messageService: MessageService) { }

  ngOnInit() {

    this.routeSubscription = this.route.data.subscribe(routeData => {
      let team = routeData['team'];
      if (team) {
        this.team = team;
        console.log("team-editor.component.ts  team: ", this.team)
        //this.createForm(this.user.name);
      }

      let user = routeData['user'];
      if(user) {
        this.user = user;
      }
    })





    // this.routeSubscription = this.route.paramMap.subscribe(async (params) => {
    //   var id = params.get('teamDocId');
    //
    //   this.team = await this.teamService.getTeamData(id);
    //
    //   this.memberSubscription = this.teamService.getMembersByTeamId(id).pipe(
    //     map(actions => {
    //       return actions.map(a => {
    //         const data = a.payload.doc.data() as TeamMember;
    //         return data;
    //         // const id = a.payload.doc.id;
    //         // var returnThis = { id, ...data };
    //         // return returnThis;
    //       });
    //     })
    //   )
    //   .subscribe(team_members => {
    //     console.log('team_members = ', team_members);
    //     this.messageService.updateTeamMembers(team_members);
    //   });
    //
    // });


  }

  ngOnDestroy() {
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
    if(this.memberSubscription) this.memberSubscription.unsubscribe();
  }

  cancelEditing(form: NgForm) {
    this.editing.emit(false);
    form.reset();
  }

  deleteTeam(form: NgForm) {
    this.editing.emit(false);
    form.reset();
  }

  onSubmit(form: NgForm) {
    // this.editing = false;
    // console.log('onSubmit:  this.user = ', this.user);
    if(!this.team.id) {
      this.teamService.create(this.team.name, this.user);
    }
    else
      this.teamService.update(this.team.id, this.team.name, this.user);
    form.reset();
  }

}
