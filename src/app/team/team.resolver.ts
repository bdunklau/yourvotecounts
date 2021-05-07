import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { TeamService } from '../team/team.service';
import { Team } from '../team/team.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class TeamResolver implements Resolve<Team> {

  constructor(public teamService: TeamService, 
    @Inject(PLATFORM_ID) private platformId,
    private router: Router) { }

  // TODO use guards instead
  async resolve(route: ActivatedRouteSnapshot) : Promise<Team> {
      if(isPlatformBrowser(this.platformId)) {
          // console.log('route = ',  route)
          console.log('route.params[teamDocId] = ',  route.params['teamDocId']);
          const team = await this.teamService.getTeamData(route.params['teamDocId']);
          return team;
      }
      return null
  }

}
