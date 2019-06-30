import { Component, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Location } from '@angular/common';
import { AuthService } from './core/auth.service';
import { UserService } from './user/user.service';
import { Router } from "@angular/router";
import { MessageService } from './core/message.service';
import { Subscription } from 'rxjs';
import { NgbDatepickerConfig, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from "./util/date-chooser/ngb-date-fr-parser-formatter"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}]
})
export class AppComponent {
  title = 'YourVoteCounts';
  isAdmin: boolean;
  isLoggedIn: boolean;
  name_or_phone: string;
  private subscription: Subscription;

  constructor(db: AngularFirestore,
    private location : Location,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private messageService: MessageService) {  }


  async ngOnInit() {
    let user = await this.userService.getCurrentUser();
    this.isAdmin = user && user.hasRole('admin');
    console.log('AppComponent:ngOnInit(): this.isAdmin = ', this.isAdmin)
    this.isLoggedIn = user != null;
    this.name_or_phone = user && user.displayName ? user.displayName : (user && user.phoneNumber ? user.phoneNumber : 'Login');
    this.subscription = this.messageService.getUser()
      .subscribe(user => {
        console.log('AppComponent: user from service: ', user);
        this.isAdmin = user && user.hasRole('admin')
        this.isLoggedIn = user != null;
        this.name_or_phone = user && user.displayName ? user.displayName : (user && user.phoneNumber ? user.phoneNumber : 'Login');
      })
  }

  // always unsubscribe
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  setAdmin(isAdmin: boolean) {
    this.isAdmin = isAdmin;
  }


  logout(){
    this.authService.doLogout()
    .then((res) => {
      this.router.navigate(['/']);
    }, (error) => {
      console.log("Logout error", error);
    });
  }
}
