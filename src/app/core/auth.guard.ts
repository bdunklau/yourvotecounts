import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from './user.service';
// import {FirebaseUIModule, firebase, firebaseui} from 'firebaseui-angular';
import {FirebaseUIModule, firebase, firebaseui} from 'firebaseui-angular';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public afAuth: AngularFireAuth, // TODO not needed
    public userService: UserService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    var user = await this.userService.getCurrentUser()
    console.log("canActivate(): user = ", user)
    if(user) {
      this.router.navigate(['/user']);
      return false
    }
    else return true;
  }
}
