import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';

@Injectable()
export class UserResolver implements Resolve<FirebaseUserModel> {

  constructor(public userService: UserService, private router: Router) { }

  // TODO use guards instead
  async resolve(route: ActivatedRouteSnapshot) : Promise<FirebaseUserModel> {
    let user = await this.userService.getCurrentUser();
    if(!user) {
      console.log('UserResolver.resolve(): No user object');
      this.router.navigate(['/login']);
      return null;
    }
    if(!user.displayName) {
      this.router.navigate(['/register']);
      return null;
    }
    return user;
  }

  // resolve(route: ActivatedRouteSnapshot) : Promise<FirebaseUserModel> {
  //
  //   let user = new FirebaseUserModel();
  //
  //   return new Promise((resolve, reject) => {
  //     this.userService.getCurrentUser()
  //     .then(user => {
  //       if(!user) {
  //         console.log('UserResolver.resolve(): No user object');
  //         this.router.navigate(['/login']);
  //         return reject('No user object');
  //       }
  //       if(!user.displayName) {
  //         this.router.navigate(['/register']);
  //         return resolve(user);
  //       }
  //       return resolve(user);
  //     }, err => {
  //       console.log('error: ', err);
  //       this.router.navigate(['/login']);
  //       return reject(err);
  //     })
  //   })
  // }

}
