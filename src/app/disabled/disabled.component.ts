import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-disabled',
  templateUrl: './disabled.component.html',
  styleUrls: ['./disabled.component.css']
})
export class DisabledComponent implements OnInit {

  private subscription: Subscription;

  constructor(private userService: UserService,
              private router: Router) { }

  async ngOnInit() {
    this.subscription = await this.userService.subscribeCurrentUser(obj => {
      console.log('ngOnInit:  subscribeCurrentUser: obj: ', obj)
      if(obj && obj.length > 0 && !obj[0].isDisabled) {
        this.router.navigate(['/myaccount']);
      }
    });
  }


  // always unsubscribe
  ngOnDestroy() {
    this.subscription.unsubscribe();
    console.log('ngOnDestroy:  this.subscription.unsubscribe()');
  }

}
