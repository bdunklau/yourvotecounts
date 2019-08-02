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
    const team = await this.teamService.getTeamData(route.params['teamDocId']);
    return team;
  }

}
