import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service'
import { isPlatformBrowser } from '@angular/common';



@Injectable({
  providedIn: 'root'
})
export class SettingsGuard implements CanActivate {

  constructor(private settingsService: SettingsService,
              @Inject(PLATFORM_ID) private platformId,
              /*private afs: AngularFirestore*/) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

      let isBrowser = isPlatformBrowser(this.platformId)
      if(isBrowser) {

          // should this be in a resolver?
          // are resolvers called before or after guards?  I need a settings resolver to be called before all the
          // guards in search-officials.guard
          // Since I'm not sure when resolvers are called, I do the "resolving" here in this guard
          let keys = await this.settingsService.getKeysDoc()
          this.settingsService.keys = keys
          //console.log('SettingsGuard:  this.settingsService.keys = ', this.settingsService.keys)
          return true
      }
      else return true
  }
  
}
