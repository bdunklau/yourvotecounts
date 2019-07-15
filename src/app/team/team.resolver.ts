import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { TeamService } from '../team/team.service';
import { Team } from '../team/team.model';

@Injectable()
export class TeamResolver implements Resolve<Team> {

  constructor(public teamService: TeamService, private router: Router) { }

  // TODO use guards instead
  async resolve(route: ActivatedRouteSnapshot) : Promise<Team> {
    // console.log('route = ',  route)
    console.log('route.params[teamDocId] = ',  route.params['teamDocId']);
    return new Team();

    // this.routeSubscription = route.paramMap.subscribe(async (params) => {
    //   var id = params.get('teamDocId');
    //
    //   let team = await this.teamService.getTeamData(id);
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





    // let user = await this.userService.getCurrentUser();
    // if(!user) {
    //   console.log('UserResolver.resolve(): No user object');
    //   this.router.navigate(['/login']);
    //   return null;
    // }
    // if(!user.displayName) {
    //   this.router.navigate(['/myaccount']);
    //   return null;
    // }
    // return user;
  }

}
