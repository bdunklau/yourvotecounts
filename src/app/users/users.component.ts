import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  user: FirebaseUserModel;

  constructor(public us: UserService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  onUserSelectedByName(user: FirebaseUserModel) {
    if(!user) return;
    this.user = user;
  }

  onUserSelectedByPhone(user: FirebaseUserModel) {
    if(!user) return;
    this.user = user;
  }

}
