import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../settings/settings.model';
import { Subscription } from 'rxjs';
import { MessageService } from '../core/message.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  user = new FirebaseUserModel();
  me:FirebaseUserModel;
  seconds = 0;
  roles;
  nameValue;
  settings: Settings;
  private subscription: Subscription;
  private userSubscription: Subscription;

  constructor(public userService: UserService,
              private settingsService: SettingsService,
              private messageService: MessageService) { }

  async ngOnInit() {
    // console.log('user = ', this.user);
    // this.me = await this.userService.getCurrentUser();

    this.subscription = this.settingsService.getSettings()
      .subscribe(obj => {
        this.settings = obj as Settings;
        console.log('getSettings():  this.settings = ', this.settings);
      });
  }

  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
    if(this.userSubscription) this.userSubscription.unsubscribe();
  }


  allDisabled() {
    return this.settings ? this.settings.disabled : false;
  }


  checked($event, user) {
    user.isDisabled = $event.srcElement.checked;
    this.userService.updateUser(user).then(async () => {
      this.user = user;
      // could override the user's selection if the database update returned
      // a true/false value you didn't expect.  Keeps the toggle in sync with the database
      $event.srcElement.checked = this.user.isDisabled;
      console.log('updateUser(): this.user.isDisabled = ', this.user.isDisabled);
    });
  }


  checkDisableAll($event, settings) {
    settings.disabled = $event.srcElement.checked;
    this.settingsService.updateSettings(settings).then(async () => {
      this.settings = settings;
      // could override the user's selection if the database update returned
      // a true/false value you didn't expect.  Keeps the toggle in sync with the database
      $event.srcElement.checked = this.settings.disabled;
      console.log('updateSettings(): this.settings.disabled = ', this.settings.disabled);
    });
  }


  onUserSelectedByName(user: FirebaseUserModel) {
    console.log("onUserSelectedByName(): user = ", user);
      // console.log("onUserSelectedByName(): user.hasRole('admin') = ", user.hasRole('admin'));
    this.set(user);
  }

  onUserSelectedByPhone(user: FirebaseUserModel) {
    this.set(user);
  }

  private set(user: FirebaseUserModel) {
    console.log("set(): user = ", user);
    if(!user) return;
    // this.user = user;
    // this.seconds = user.date_ms;
    // this.roles = user.roles;
    // this.nameValue = user.displayName;
    //   console.log("set(): this.user.hasRole('admin') = ", this.user.hasRole('admin'));

    this.userSubscription = this.userService.subscribe(user.uid, (users:[FirebaseUserModel]) => {
      if(users && users.length > 0) {
        this.user = users[0];
        this.nameValue = this.user.displayName;
      }
    })
  }

  async onSubmit() {
    this.user.displayName = this.nameValue;
    this.userService.updateUser(this.user);
  }

  cancel() {
    this.set(this.user);
  }

}
