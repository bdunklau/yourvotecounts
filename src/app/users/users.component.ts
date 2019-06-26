import { Component, OnInit } from '@angular/core';
// import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FirebaseUserModel } from '../user/user.model'
import { Observable, Subject, Subscription } from 'rxjs/Observable'
import { UserService } from '../user/user.service'

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  subject = new Subject<any>();
  nameVal: string;
  // respbody: String;
  // headers: String[];
  // ref: AngularFirestoreCollection<FirebaseUserModel>;
  // list: Observable<FirebaseUserModel[]>;
  subscription: Subscription;

  constructor(/*private afs: AngularFirestore,*/
              public us: UserService) { }

  ngOnInit() {
    // console.log("this.afs = ", this.afs)
    // console.log("this.afs.collection = ", this.afs.collection)
    // this.ref = this.afs.collection('user', ref => ref.orderBy('date_ms'))
    // this.list = this.ref.valueChanges()


    // aka Dynamic Query
    this.subscription = this.subject.pipe(/*
      need take(1) or something like that
      Only want a single query - nothing observable
    */).subscribe((something) => {
      let xx:LogEntry[] = something as LogEntry[];
      //console.log('xx = ', xx)
      this.log = xx;
    });
  }

  // deleteUser(uid: String) {
  //   this.us.deleteUser(uid)
  //   .subscribe(resp => {
  //     console.log("resp: ", resp) // json formatted string
  //   });
  // }

  onNameEntered(nameVal: string) {
    // console.log('onNameEntered: nameVal = ', nameVal);
    this.nameVal = nameVal;
    this.subject.next({nameVal: nameVal});
  }

}
