import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';

@Injectable()
export class UserResolver implements Resolve<FirebaseUserModel> {

  constructor(public userService: UserService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot) : Promise<FirebaseUserModel> {

    let user = new FirebaseUserModel();

    return new Promise((resolve, reject) => {
      this.userService.getCurrentUser()
      .then(user => {
        console.log("UserResolver.resolve(): user.resolver.ts:resolve() user = ", user);
        console.log("UserResolver.resolve(): user.resolver.ts:resolve() user.isAdmin() = ", user.isAdmin());
        if(!user) {
          console.log('UserResolver.resolve(): No user object');
          this.router.navigate(['/login']);
          return reject('No user object');
        }
        if(!user.displayName) {
          this.router.navigate(['/register']);
          return resolve(user);
        }
        return resolve(user);
      }, err => {
        console.log('error: ', err);
        this.router.navigate(['/login']);
        return reject(err);
      })
    })
  }

  // resolve(route: ActivatedRouteSnapshot) : Promise<FirebaseUserModel> {
  //
  //   let user = new FirebaseUserModel();
  //
  //   return new Promise((resolve, reject) => {
  //     this.userService.getCurrentUser()
  //     .then(res => {
  //       console.log("user.resolver.ts:resolve() res = ", res);
  //       if(res.providerData[0].providerId == 'password'){
  //         user.image = 'https://via.placeholder.com/400x300';
  //         user.displayName = res.displayName;
  //         user.provider = res.providerData[0].providerId;
  //       }
  //       else{
  //         user.image = res.photoURL;
  //         user.displayName = res.displayName;
  //         user.provider = res.providerData[0].providerId;
  //       }
  //       if(res.phoneNumber) user.phoneNumber = res.phoneNumber;
  //       if(res.roles) user.roles = res.roles;
  //       console.log("UserResolver: user = ", user)
  //
  //       if(!res.displayName && !res.email) {
  //         this.router.navigate(['/register']);
  //         return resolve(user);
  //       }
  //
  //       return resolve(user);
  //
  //     }, err => {
  //       console.log('error: ', err);
  //       this.router.navigate(['/login']);
  //       return reject(err);
  //     })
  //   })
  // }
}
