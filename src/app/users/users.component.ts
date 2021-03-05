import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from '../user/user.model';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../settings/settings.model';
import { Subscription } from 'rxjs';
import { MessageService } from '../core/message.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { map } from 'rxjs/operators';
import * as _ from 'lodash'



@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: FirebaseUserModel[]
  user = new FirebaseUserModel();
  me:FirebaseUserModel;
  seconds = 0;
  roles;
  nameValue;
  settings: Settings;
  private subscription: Subscription;
  private userSubscription: Subscription;
  private usersSubscription: Subscription
  access_expiration;

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

      
      this.usersSubscription = this.userService.getUsersByDate().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as FirebaseUserModel 
            // const id = a.payload.doc['id']; already have 'uid' on doc
            // var returnThis = { id, ...data };
            return data;
          });
        })
      )
      .subscribe(objs => {
          // need TeamMember objects, not Team's, because we need the leader attribute from TeamMember
          this.users = _.map(objs, obj => {
            let tm = obj as unknown;
            return tm as FirebaseUserModel
          });
      });
  }

  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
    if(this.userSubscription) this.userSubscription.unsubscribe();
    if(this.usersSubscription) this.usersSubscription.unsubscribe();
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
    let self = this
    this.userSubscription = this.userService.subscribe(user.uid, (users:[FirebaseUserModel]) => {
      if(users && users.length > 0) {
        this.user = users[0];
        this.nameValue = this.user.displayName;
        self.access_expiration = new Date(this.user.access_expiration_ms)
      }
    })
  }

  async onSubmit() {
    this.user.displayName = this.nameValue;
    this.user.access_expiration_ms = this.access_expiration.getTime()
    this.userService.updateUser(this.user);
  }

  cancel() {
    this.set(this.user);
  }


  captureDate(type: string, event: MatDatepickerInputEvent<Date>) {
    if(event.value.getTime()) {
        this.access_expiration = new Date(event.value.getTime() + 24 * 60 * 60 * 1000 - 1000) // 11:59:59pm
    }
  }

}
