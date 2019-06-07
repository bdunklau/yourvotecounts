import { Injectable } from "@angular/core";
// import 'rxjs/add/operator/toPromise';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class UserService {

  constructor(
    public db: AngularFirestore,
    private http: HttpClient,
    public afAuth: AngularFireAuth
  ){}


  getCurrentUser(){
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().onAuthStateChanged(function(user){
        if (user) {
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
