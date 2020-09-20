import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
//import { PhonePipe } from '../util/phone/phone.pipe';
import { environment } from '../../environments/environment';
import { MessageService } from '../core/message.service';


@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

    nameValue: string;
    phoneNumber: string;
    photoURL: string;
    photoFileName: string;
    oldPhotoFileName: string;
    user: FirebaseUserModel;
    editing = false;
    uploadProgress: Observable<number>;
    downloadURL: Observable<string>;
    userSubscription: Subscription;
    ref: AngularFireStorageReference;
    current = 0;
    max = 100;
    isUploading = false;
    // task: AngularFireUploadTask;

    constructor(private userService: UserService,
                private afStorage: AngularFireStorage,
                private messageService: MessageService,
              ) { }

    async ngOnInit() {
      this.user = await this.userService.getCurrentUser();

      this.userSubscription = this.userService.subscribe(this.user.uid, async (users:[FirebaseUserModel]) => {
        console.log('ngOnInit: entered');
        if(users && users.length > 0) {
          this.user = users[0];
          this.nameValue = this.user.displayName;
          this.phoneNumber = this.user.phoneNumber;
          //this.photoURL = this.user.photoURL;  // 8/11/20 not using this.user.photoURL
          this.photoFileName = this.user.photoFileName;
          if(this.oldPhotoFileName && this.oldPhotoFileName != this.user.photoFileName) {
            // delete the old profile-pic and thumb_profile-pic in storage
            this.afStorage.ref(this.oldPhotoFileName).delete();
            let pic = this.oldPhotoFileName.substring("thumb_".length)
            this.afStorage.ref(pic).delete();
          }
          this.oldPhotoFileName = this.user.photoFileName;
          
          // Create a reference from a Google Cloud Storage URI
          console.log('environment.firebase.storageBucket:  ', environment.firebase.storageBucket)
          if(this.user.photoFileName) {
              console.log('this.user.photoFileName:  '+this.user.photoFileName)
              await this.afStorage.storage
                 .refFromURL('gs://'+environment.firebase.storageBucket+'/'+this.user.photoFileName)
                 .getDownloadURL().then(url => {
                     console.log("this.photoURL = ", url)
                     this.photoURL = url;
                     this.isUploading = false;
                  })
          }
          
          console.log('ngOnInit: photoURL = ', this.photoURL);
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
      this.isUploading = true;
      // this should be in the UserService class but couldn't get everything to compile when I moved
      // all the code over there.  Kept getting errors like:
      //   'UploadTaskSnapshot' is not assignable to type 'AngularFireUploadTask'

      // NOTE: When changing pics, the file name in storage HAS to change.  Otherwise, the URL doesn't
      // change which means the UI doesn't update with the new image.  What a hassle.

      // Upload the new image, create the thumbnail and add it to the user's record
  
      // This put() triggers functions/my-account.js: generateThumbnail()
      const user:FirebaseUserModel = await this.userService.getCurrentUser();
      const uid = user.uid;
      const tstamp = '-ts-'+new Date().getTime() // unique means the page will update with new image
      this.ref = this.afStorage.ref('profile-pic-'+uid+tstamp);
      const task = this.ref.put(event.target.files[0]);
      this.uploadProgress = task.percentageChanges();
      this.uploadProgress.subscribe(obj => {
        this.current = (obj * 100) / 100
        if(obj === 100) {
          // 100 = 100% complete - aka the upload is done
          // do stuff here if you want
        }
      })

    }

}


