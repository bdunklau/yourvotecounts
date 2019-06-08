import { Injectable } from '@angular/core';
import { CanActivate, Router } from "@angular/router";
import { UserService } from './user.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public userService: UserService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      var user = await this.userService.getCurrentUser()

      console.log("canActivate(): user = ", user)
      if(user && !user.displayName) {
        this.router.navigate(['/register']);
        return false
      } else if(user) {
        this.router.navigate(['/user']);
        return false
      }
      else return true;
    } catch(e) {
      return true;
    }
  }
}
