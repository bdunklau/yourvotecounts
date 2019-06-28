import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  user = new FirebaseUserModel();
  seconds = 0;
  roles;

  constructor(public us: UserService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  onUserSelectedByName(user: FirebaseUserModel) {
    this.set(user);
  }

  onUserSelectedByPhone(user: FirebaseUserModel) {
    this.set(user);
  }

  private set(user: FirebaseUserModel) {
    if(!user) return;
    this.user = user;
    this.seconds = user.date_ms;
    this.roles = user.roles;
  }

}
