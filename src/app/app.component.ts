import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Location } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'YourVoteCounts';

  constructor(db: AngularFirestore,
    private location : Location,
    private authService: AuthService) {  }


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
