import { Component, OnInit, Input } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { ActivatedRoute/*, CanActivate, RouterStateSnapshot, Router*/ } from '@angular/router';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {

  @Input() user: FirebaseUserModel;
  @Output() selectedTeam = new EventEmitter<Team>();
  phoneVal: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
  }

  editTeam(team: Team) {
  }

}
