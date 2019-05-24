import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FirebaseUserModel } from '../core/user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: FirebaseUserModel = new FirebaseUserModel();

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private location : Location) { }

  ngOnInit() {
    console.log("user.component.ts: ngOnInit()")
    console.log("user.component.ts: ngOnInit(): this.route = ", this.route)
    console.log("user.component.ts: ngOnInit(): this.route.data = ", this.route.data)
    console.log("user.component.ts: ngOnInit(): this.route.snapshot = ", this.route.snapshot)
    this.route.data.subscribe(routeData => {
      let data = routeData['data'];
      if (data) {
        this.user = data;
        console.log("user.component.ts  user: ", this.user)
        //this.createForm(this.user.name);
      }
    })
  }

  logout(){
    this.authService.doLogout()
    .then((res) => {
      console.log("UserComponent.logout(): this.location.back()")
      this.location.back();
    }, (error) => {
      console.log("Logout error", error);
    });
  }

}
