import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';
import { FirebaseUserModel } from '../user/user.model';
// import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { AngularFireStorage } from '@angular/fire/storage';

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
    // public uploader: FileUploader = new FileUploader({url: UploadURL, itemAlias: 'photo'}); // DI this?

    constructor(private userService: UserService,
                private afStorage: AngularFireStorage) { }

    async ngOnInit() {
      this.user = await this.userService.getCurrentUser();
      if(this.user && !this.user.displayName) { // add more criteria as needed
        this.editing = true;
      }
      if(this.user) {
        this.nameValue = this.user.displayName;
        this.phoneNumber = this.user.phoneNumber;
      }

      // this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
      // this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      //    console.log('FileUpload:uploaded:', item, status, response);
      //    alert('File uploaded successfully');
      // }
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

}
