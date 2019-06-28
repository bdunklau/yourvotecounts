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
  nameValue;

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
    this.nameValue = user.displayName;
  }

  async onSubmit() {
    this.user.displayName = this.nameValue;
    this.userService.updateCurrentUser(this.user);
    this.editing = false;
  }

}
