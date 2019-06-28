import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

    nameValue: string;
    phoneNumber: string;
    user: FirebaseUserModel;
    editing = false;

    constructor(private userService: UserService) { }

    async ngOnInit() {
      this.user = await this.userService.getCurrentUser();
      this.user_orig = this.user;
      if(this.user && !this.user.displayName) { // add more criteria as needed
        this.editing = true;
      }
      if(this.user) {
        this.nameValue = this.user.displayName;
        this.phoneNumber = this.user.phoneNumber;
      }
    }

    async onSubmit() {
      this.user.displayName = this.nameValue;
      this.userService.updateCurrentUser(this.user);
      this.editing = false;
    }

    edit() {
      this.editing = true;
    }

    cancel() {
      this.editing = false;
      this.nameValue = this.user.displayName;
      this.phoneNumber = this.user.phoneNumber;
    }

}
