import { Component, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Location } from '@angular/common';
import { AuthService } from './core/auth.service';
// import { UserService } from './user/user.service';
import { Router } from "@angular/router";
import { MessageService } from './core/message.service';
import { Subscription } from 'rxjs';
import { NgbDatepickerConfig, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from "./util/date-chooser/ngb-date-fr-parser-formatter";
//import Hammer from 'hammerjs'; // to capture touch events
// import { BrowserModule } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}]
})
export class AppComponent {
  title = 'SeeSaw';
  isAdmin: boolean;
  isLoggedIn: boolean;
  name_or_phone: string;
  private userSubscription: Subscription;


  constructor(private authService: AuthService,
              private router: Router,
              private messageService: MessageService) {}


  async ngOnInit() {
    // console.log('user = ', this.user);
    // this.me = await this.userService.getCurrentUser();

    var nxt = function(value /* FirebaseUserModel */) {
      console.log('AppComponent: next(): value = ', value);
      console.log('AppComponent: next(): this = ', this);
      if(value) this.setAdmin(value.isAdmin())
      if(value) this.isLoggedIn = true;
      if(value && value.phoneNumber) this.name_or_phone = value.phoneNumber; // TODO not tested
      if(value && value.displayName) this.name_or_phone = value.displayName; // TODO not tested
      if(!value) this.isLoggedIn = false;
      if(!value) this.name_or_phone = ""; // TODO not tested
      if(!value) this.setAdmin(false); // TODO not tested
    }.bind(this);

    this.messageService.listenForUser().subscribe({
          next: nxt,
          error: function(value) {
          },
          complete: function() {
          }
      })
  }


  // always unsubscribe
  ngOnDestroy() {
    if(this.userSubscription) this.userSubscription.unsubscribe();
    console.log('ngOnDestroy:  this.userSubscription.unsubscribe()')
  }

  // https://www.w3schools.com/howto/howto_js_sidenav.asp
  /* Set the width of the side navigation to 250px */
  openNav(event) {
    document.getElementById("mySidenav").style.width = "250px";
    // document.getElementById("thebody").addEventListener('click', this.closeNav, true);
    // document.body.addEventListener('click', this.fn, true);
    // document.body.addEventListener('click', function() {window.alert('body clicked')})
  }

  // https://www.w3schools.com/howto/howto_js_sidenav.asp
  /* Set the width of the side navigation to 0 */
  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    // document.getElementById("thebody").removeEventListener('click', this.closeNav);
  }

  // closeListener(): () => void {
  //   const fn = this.closeNav;//.bind(this)
  //   return fn;
  // }


  setAdmin(isAdmin: boolean) {
    this.isAdmin = isAdmin;
  }


  logout(){
    this.closeNav();
    this.authService.doLogout()
    .then((res) => {
        this.router.navigate(['/']);
      },
      (error) => {
        console.log("Logout error", error);
      }
    );
  }
}
