import { Component, OnInit, Input } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {

  @Input() user: FirebaseUserModel;

  constructor() { }

  ngOnInit() {
  }

}
