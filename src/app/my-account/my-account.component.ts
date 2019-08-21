import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs/Observable';
const UploadURL = 'http://localhost:3000/api/upload';


@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

    nameValue: string;
    phoneNumber: string;
    user: FirebaseUserModel;
    editing = false;
    uploadProgress: Observable<number>;
    downloadURL: Observable<string>;

    constructor(private userService: UserService,
                private afStorage: AngularFireStorage,) { }

    async ngOnInit() {
      this.user = await this.userService.getCurrentUser();
      if(this.user && !this.user.displayName) { // add more criteria as needed
        this.editing = true;
      }
      if(this.user) {
        this.nameValue = this.user.displayName;
        this.phoneNumber = this.user.phoneNumber;
        this.photoURL = this.user.photoURL;
      }

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
    async upload(event) {
      const user:FirebaseUserModel = await this.userService.getCurrentUser();
      const uid = user.uid;
      this.ref = this.afStorage.ref('profile-pic-'+uid);
      this.task = this.ref.put(event.target.files[0]);
      this.uploadProgress = this.task.percentageChanges();
      // this.downloadURL = this.task.downloadURL();
    }

}
