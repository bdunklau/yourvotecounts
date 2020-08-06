import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

    nameValue: string;
    phoneNumber: string;
    photoURL: string;
    user: FirebaseUserModel;
    editing = false;
    uploadProgress: Observable<number>;
    downloadURL: Observable<string>;
    userSubscription: Subscription;
    ref: AngularFireStorageReference;
    // task: AngularFireUploadTask;

    constructor(private userService: UserService,
                private afStorage: AngularFireStorage,
              ) { }

    async ngOnInit() {
      this.user = await this.userService.getCurrentUser();

      this.userSubscription = this.userService.subscribe(this.user.uid, (users:[FirebaseUserModel]) => {
        console.log('ngOnInit: entered');
        if(users && users.length > 0) {
          this.user = users[0];
          this.nameValue = this.user.displayName;
          this.phoneNumber = this.user.phoneNumber;
          this.photoURL = this.user.photoURL;
          console.log('ngOnInit: photoURL = ', this.photoURL);

          // don't think we need this anymore.  I think minimal-account-info replaces this
          // if(!this.user.displayName) { // add more criteria as needed
          //   this.editing = true;
          // }
        }
      })

    }

    ngOnDestroy() {
      if(this.userSubscription) this.userSubscription.unsubscribe();
    }

    async onSubmit() {
      this.user.displayName = this.nameValue;
      this.userService.updateCurrentUser(this.user);
      this.editing = false;
    }

    edit() {
      this.editing = true;
    }

    cancel() {
      this.editing = false;
      this.nameValue = this.user.displayName;
      this.phoneNumber = this.user.phoneNumber;
    }

    // code came from:   https://medium.com/codingthesmartway-com-blog/firebase-cloud-storage-with-angular-394566fd529
    async uploadPhoto(event) {
      // this should be in the UserService class but couldn't get everything to compile when I moved
      // all the code over there.  Kept getting errors like:
      //   'UploadTaskSnapshot' is not assignable to type 'AngularFireUploadTask'

      // NOTE: When changing pics, the file name in storage HAS to change.  Otherwise, the URL doesn't
      // change which means the UI doesn't update with the new image.  What a hassle.

      // so first, does the user have a photoFileName already?  Because if it does, we are
      // going to delete that file in storage first (because we only want to hold on to one pic per user)
      const user:FirebaseUserModel = await this.userService.getCurrentUser();
      const uid = user.uid;
      const needToReplace = user.photoFileName && user.photoFileName !== '';
      if(needToReplace) {
        this.ref = this.afStorage.ref(user.photoFileName); // thumb_profile-pic-
        await this.ref.delete();
        const origFile = user.photoFileName.substring('thumb_'.length);
        await this.afStorage.ref(origFile).delete;
      }
      else {

      }

      this.ref = this.afStorage.ref('profile-pic-'+uid);
      await this.ref.delete(); // AREN'T WE DELETING BOTH PICS?  DOESN'T LOOK LIKE IT!  HOLD OFF ON THIS STUFF ABOVE
      await this.afStorage.ref('thumb_profile-pic-'+uid).delete();
      // this.task = this.ref.put(event.target.files[0]);
      const task = this.ref.put(event.target.files[0]);
      // this.uploadProgress = this.task.percentageChanges();
      this.uploadProgress = task.percentageChanges();
      this.uploadProgress.subscribe(obj => {
        console.log('uploadProgress: obj = ',obj);
        console.log('uploadProgress: this = ',this);
        if(obj === 100) {
          this.photoURL = this.user.photoURL;
          console.log('uploadProgress: DONE');
        }
      })
      // this.downloadURL = this.task.downloadURL();
    }

}
