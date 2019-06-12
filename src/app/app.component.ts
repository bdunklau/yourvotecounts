import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Location } from '@angular/common';
import { AuthService } from './core/auth.service';
import { UserService } from './user/user.service';
import { Router } from "@angular/router";
import { MessageService } from './core/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'YourVoteCounts';
  isAdmin: boolean;
  private subscription: Subscription;

  constructor(db: AngularFirestore,
    private location : Location,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private messageService: MessageService) {  }


  ngOnInit() {
    this.subscription = this.messageService.getUser()
      .subscribe(user => {
        console.log('AppComponent: this.userFromSibling = ', user);
        this.isAdmin = user && user.hasRole('admin')
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
