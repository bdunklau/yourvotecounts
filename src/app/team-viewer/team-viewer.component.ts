import { Component, OnInit, OnDestroy } from '@angular/core';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { Team } from '../team/team.model';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '../team/team.service';
import { map/*, take*/ } from 'rxjs/operators';
import { MessageService } from '../core/message.service';
import { TeamMember } from '../team/team-member.model';

@Component({
  selector: 'app-team-viewer',
  templateUrl: './team-viewer.component.html',
  styleUrls: ['./team-viewer.component.css']
})
export class TeamViewerComponent implements OnInit {

  team: Team;
  private routeSubscription: Subscription;
  private memberSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private teamService: TeamService,
              private messageService: MessageService) { }

  ngOnInit() {

  this.routeSubscription = this.route.paramMap.subscribe(async (params) => {
    var id = params.get('teamDocId');
    // console.log('routeSubscription: params.teamDocId = ', params.get('teamDocId'));
    // this.products.forEach((p: Product) => {
    //   if (p.id == params.teamDocId) {
    //     this.product = p;
    //   }
    // });

    this.team = await this.teamService.getTeamData(id);

    this.memberSubscription = this.teamService.getMembersByTeamId(id).pipe(
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

    });

  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.memberSubscription.unsubscribe();
  }

}
