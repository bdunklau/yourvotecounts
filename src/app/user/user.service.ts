import { Injectable } from "@angular/core";
// import 'rxjs/add/operator/toPromise';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { FirebaseUserModel } from '../user/user.model';
import { take } from 'rxjs/operators';

@Injectable()
export class UserService {

  private user: FirebaseUserModel;

  constructor(
    private afs: AngularFirestore,
    private http: HttpClient,
    public afAuth: AngularFireAuth
  ){}


  // query /user for the user's roles and other attributes that aren't part of firebase.user
  async getCurrentUser() : Promise<FirebaseUserModel> {
    var user = await this.createFirebaseUserModel()
    console.log("UserService.getCurrentUser(): user = ", user)

    return new Promise<any>((resolve, reject) => {
      var ref = this.afs.collection('user', rf => rf.where("uid", "==", user.uid).limit(1)).valueChanges().pipe(take(1))
      var sub = ref.subscribe((data: [FirebaseUserModel]) => {
        console.log('ref.subscribe:  data = ', data)
        user.roles = data[0].roles
        resolve(user)
      })
    })


  }


  // create FirebaseUserModel from firebase.user
  private createFirebaseUserModel() : Promise<FirebaseUserModel> {

    let user = new FirebaseUserModel();

    return new Promise((resolve, reject) => {
      this.getFirebaseUser()
      .then(res => {
        console.log("user.service.ts:resolve() res = ", res);
        if(res.providerData[0].providerId == 'password'){
          user.image = 'https://via.placeholder.com/400x300';
        }
        else{
          user.image = res.photoURL;
        }
        user.displayName = res.displayName;
        user.provider = res.providerData[0].providerId;
        if(res.phoneNumber) user.phoneNumber = res.phoneNumber;
        user.uid = res.uid
        console.log("user.service.ts: user = ", user)

        if(!res.displayName && !res.email) {
          // this.router.navigate(['/register']);
          return resolve(user);
        }

        return resolve(user);

      }, err => {
        console.log('error: ', err);
        // this.router.navigate(['/login']);
        return reject(err);
      })
    })
  }


  private getFirebaseUser() {
    // this.afs.collection('user', ref => ref.orderBy('date_ms'))
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().onAuthStateChanged(function(user){
        if (user) {
          // var ref = this.afs.collection('user').where("uid", "==", user.uid)
          // ref.get().then(function (querySnapshot) {
          //     querySnapshot.forEach(function (doc) {
          //         console.log(doc.id, ' => ', doc.data());
          //     });
          // });
          resolve(user);
        } else {
          reject('No user logged in');
        }
      })
    })
  }

  getCurrentUserOrig() {
    console.log("getCurrentUser(): this.afs = ", this.afs)
    // this.afs.collection('user', ref => ref.orderBy('date_ms'))
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().onAuthStateChanged(function(user){
        if (user) {
          // var ref = this.afs.collection('user').where("uid", "==", user.uid)
          // ref.get().then(function (querySnapshot) {
          //     querySnapshot.forEach(function (doc) {
          //         console.log(doc.id, ' => ', doc.data());
          //     });
          // });
          resolve(user);
        } else {
          reject('No user logged in');
        }
      })
    })
  }

  updateCurrentUser(value){
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: value.name,
        photoURL: user.photoURL
      }).then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }

  // any user, not just the current user
  deleteUser(uid): Observable<void> {

      let url = 'https://us-central1-yourvotecounts-bd737.cloudfunctions.net/initiateDeleteUser'
      // let url = 'http://localhost:5001/yourvotecounts-bd737/us-central1/initiateDeleteUser'

      // not for GET's - I don't think
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'Authorization': 'my-auth-token',
          'Access-Control-Allow-Origin': '*'
        }),
        params: new HttpParams().set('uid', uid)
      };

      // ref:  Angular HttpClient   https://angular.io/guide/http
      return this.http.delete<void>(url, httpOptions)
              .pipe(catchError(this.handleError))
  }

  handleError(err: HttpErrorResponse) {
    console.log("handleError:  err = ", err)
    return throwError("oh man - problem")
  }
}
