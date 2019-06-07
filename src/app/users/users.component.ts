import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FirebaseUserModel } from '../core/user.model'
import { Observable } from 'rxjs/Observable'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../core/user.service'

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  respbody: String;
  headers: String[];
  ref: AngularFirestoreCollection<FirebaseUserModel>;
  list: Observable<FirebaseUserModel[]>;

  constructor(private afs: AngularFirestore,
              public us: UserService) { }

  ngOnInit() {
    console.log("this.afs = ", this.afs)
    console.log("this.afs.collection = ", this.afs.collection)
    this.ref = this.afs.collection('user', ref => ref.orderBy('date_ms'))
    this.list = this.ref.valueChanges()
  }

  deleteUser(uid: String) {
    this.us.deleteUser(uid)
    .subscribe(resp => {
      console.log("resp: ", resp) // json formatted string
    });
  }

}
