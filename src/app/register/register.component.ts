import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  nameValue: string;

  submitted = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  async onSubmit() {
    // this.submitted = true;
    // this.userService.updateCurrentUser({name: this.nameValue});
  }

}
