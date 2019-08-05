import { Component, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Location } from '@angular/common';
import { AuthService } from './core/auth.service';
import { UserService } from './user/user.service';
import { Router } from "@angular/router";
// import { MessageService } from './core/message.service';
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
    // private messageService: MessageService
  ) {  }


  async ngOnInit() {

    this.subscription = await this.userService.subscribeCurrentUser(obj => {
      if(obj && obj.length > 0 && obj[0].isDisabled) {
        this.router.navigate(['/disabled']);
      }
    });
    let user = await this.userService.getCurrentUser();
    this.isAdmin = user && user.hasRole('admin');
    console.log('AppComponent:ngOnInit(): this.isAdmin = ', this.isAdmin)
    this.isLoggedIn = user != null;
    this.name_or_phone = user && user.displayName ? user.displayName : (user && user.phoneNumber ? user.phoneNumber : 'Login');
  }

  // always unsubscribe
  ngOnDestroy() {
    this.subscription.unsubscribe();
    console.log('ngOnDestroy:  this.subscription.unsubscribe()')
  }


  // https://www.w3schools.com/howto/howto_js_sidenav.asp
  /* Set the width of the side navigation to 250px */
  openNav(event) {
    document.getElementById("mySidenav").style.width = "250px";
  }

  // https://www.w3schools.com/howto/howto_js_sidenav.asp
  /* Set the width of the side navigation to 0 */
  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
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
