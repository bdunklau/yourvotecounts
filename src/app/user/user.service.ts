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
import { LogService } from '../log/log.service';
import { MessageService } from '../core/message.service';


@Injectable()
export class UserService {

  private user: FirebaseUserModel;

  constructor(
    private afs: AngularFirestore,
    private http: HttpClient,
    public afAuth: AngularFireAuth,
    private log: LogService,
    private messageService: MessageService
  ){ }

  ngOnInit() {

  }

  ngOnDestroy() {
    // unsubscribe to all subscriptions here
  }


  signOut() {
    this.user = null
    this.messageService.updateUser(this.user);
  }


  // query /user for the user's roles and other attributes that aren't part of firebase.user
  async getCurrentUser() : Promise<FirebaseUserModel> {
    if(this.user) {
      // TODO verified on 6//10/19 but not part of automated testing yet.  Need a mock/spy LogService
      await this.log.d({event: 'get cached user', uid: this.user.uid, phoneNumber: this.user.phoneNumber})
      console.log('getCurrentUser() got cached user');
      return this.user
    }

    return new Promise<any>(async (resolve, reject) => {
      console.log('getCurrentUser() about to await this.createFirebaseUserModel()');
      var user = await this.createFirebaseUserModel()
      .catch(function(error) {
        console.log('getCurrentUser():  error: ', error);
        reject(error);
      })

      if(!user) {
        console.log('getCurrentUser() user = ', user, '  so resolve/return early');
        resolve(user);
        return;
      }

      console.log('getCurrentUser() this.afs = ', this.afs);
      var ref = this.afs.collection('user', rf => rf.where("uid", "==", user.uid).limit(1)).valueChanges().pipe(take(1))
      console.log('getCurrentUser() about to ref.subscribe()');
      var sub = ref.subscribe((data: [FirebaseUserModel]) => {
        // console.log('ref.subscribe:  data = ', data)
        user.roles = data[0].roles
        this.user = user
        this.messageService.updateUser(this.user) // how app.component.ts knows we have a user now
        resolve(this.user)
      })

    })
  }


  // create FirebaseUserModel from firebase.user
  private createFirebaseUserModel() : Promise<any> {

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
        user.uid = res.uid;
        console.log("createFirebaseUserModel(): user = ", user);
        return resolve(user);

      }, err => {
        console.log('error: ', err);
        // this.router.navigate(['/login']);
        return reject('createFirebaseUserModel(): err = ', err);
      })
    })
  }

  public getFirebaseUser() {
    // this.afs.collection('user', ref => ref.orderBy('date_ms'))
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
