import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FirebaseUserModel } from '../core/user.model'
import { Observable } from 'rxjs/Observable'
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  ref: AngularFirestoreCollection<FirebaseUserModel>;
  list: Observable<FirebaseUserModel[]>;

  constructor(private afs: AngularFirestore,
              private http: HttpClient) { }

  ngOnInit() {
    console.log("this.afs = ", this.afs)
    console.log("this.afs.collection = ", this.afs.collection)
    this.ref = this.afs.collection('user', ref => ref.orderBy('date_ms'))
    this.list = this.ref.valueChanges()
  }

  deleteUser(uid) {
    console.log("delete this user: ", uid)
    // example:   https://angularfirebase.com/snippets/trigger-http-cloud-functions-from-an-angular-component/

    let url = 'https://us-central1-yourvotecounts-bd737.cloudfunctions.net/initiateDeleteUser'
    const httpOptions = {
       headers: new HttpHeaders({
         'Content-Type':  'application/json',
         'Authorization': 'secret-key',
         'Access-Control-Allow-Origin': '*'
       })
    };
    // ref:  Angular HttpClient   https://angular.io/guide/http
    // TODO really should put this in a service, not in the component.  See the ref above
    return this.http.get(url+'?uid='+uid);

  }



}
