import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

    nameValue: string;

    stuffNeeded = false;

    constructor(private userService: UserService) { }

    async ngOnInit() {
      let user = await this.userService.getCurrentUser();
      if(user && !user.displayName) {
        this.stuffNeeded = true;
      }
    }

    async onSubmit() {
      this.stuffNeeded = true;
      this.userService.updateCurrentUser({name: this.nameValue});
    }

}
