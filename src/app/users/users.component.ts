import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FirebaseUserModel } from '../core/user.model'
import { Observable } from 'rxjs/Observable'

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  ref: AngularFirestoreCollection<FirebaseUserModel>;
  list: Observable<FirebaseUserModel[]>;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.ref = this.afs.collection('user', ref => ref.orderBy('date_ms'))
    this.list = this.ref.valueChanges()
  }

}
