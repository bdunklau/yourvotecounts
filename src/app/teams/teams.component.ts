import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  user: FirebaseUserModel;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.getCurrentUser().then(user => {this.user = user;});
  }

}
