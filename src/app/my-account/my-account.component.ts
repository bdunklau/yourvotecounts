import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

    nameValue: string;

    submitted = false;

    constructor(private userService: UserService) { }

    ngOnInit() {
    }

    async onSubmit() {
      this.submitted = true;
      this.userService.updateCurrentUser({name: this.nameValue});
    }

}
