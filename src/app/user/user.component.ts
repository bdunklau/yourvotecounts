import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseUserModel } from '../user/user.model';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: FirebaseUserModel = new FirebaseUserModel();
  subscription: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    console.log("user.component.ts: ngOnInit()")
    console.log("user.component.ts: ngOnInit(): this.route = ", this.route)
    console.log("user.component.ts: ngOnInit(): this.route.data = ", this.route.data)
    console.log("user.component.ts: ngOnInit(): this.route.snapshot = ", this.route.snapshot)
    this.subscription = this.route.data.subscribe(routeData => {
      let data = routeData['data'];
      if (data) {
        this.user = data;
        console.log("user.component.ts  user: ", this.user)
        //this.createForm(this.user.name);
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
