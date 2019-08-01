import { Injectable } from "@angular/core";
// import 'rxjs/add/operator/toPromise';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { FirebaseUserModel } from '../user/user.model';
import 'rxjs/add/operator/map'
import { LogService } from '../log/log.service';
import { MessageService } from '../core/message.service';
import { Team } from '../team/team.model';
import { map } from 'rxjs/operators';


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
    // isn't this just for components, not services?
  }

  ngOnDestroy() {
    // isn't this just for components, not services?
  }


  // create FirebaseUserModel from firebase.user
  private createFirebaseUserModel() : Promise<any> {
    return new Promise((resolve, reject) => {
      this.getFirebaseUser()
      .then(res => {
        // console.log("user.service.ts:resolve() res = ", res);
        let user:FirebaseUserModel = this.firebaseUserToFirebaseUserModel(res)
        return resolve(user);

      }, err => {
        console.log('createFirebaseUserModel(): error: ', err);
        return reject(err);
      })
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

  private firebaseUserToFirebaseUserModel(firebase_auth_currentUser):FirebaseUserModel {
    let user = new FirebaseUserModel();
    if(firebase_auth_currentUser.providerData[0].providerId == 'password'){
      user.image = 'https://via.placeholder.com/400x300';
    }
    else{
      user.image = firebase_auth_currentUser.photoURL;
    }
    user.displayName = firebase_auth_currentUser.displayName;
    user.provider = firebase_auth_currentUser.providerData[0].providerId;
    if(firebase_auth_currentUser.phoneNumber) user.phoneNumber = firebase_auth_currentUser.phoneNumber;
    user.uid = firebase_auth_currentUser.uid;
    return user;
  }

  async getCurrentUser() : Promise<FirebaseUserModel> {
    if(this.user) {
      // TODO verified on 6//10/19 but not part of automated testing yet.  Need a mock/spy LogService
      return this.user
    }
    var user = await this.createFirebaseUserModel()
    .catch(function(error) {
      console.log('getCurrentUser():  error: ', error);
    })

    if(!user) {
      console.log('getCurrentUser() user = ', user, '  so return early');
      return null;
    }

    return new Promise<FirebaseUserModel>(async (resolve, reject) => {
      var userDoc = await this.afs.collection('user').doc(user.uid).ref.get();
      this.user = user;
      this.user.populate(userDoc.data());
      this.messageService.updateUser(this.user); // how app.component.ts knows we have a user now
      resolve(this.user);
    });
  }

  private getFirebaseUser() {
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

  handleError(err: HttpErrorResponse) {
    console.log("handleError:  err = ", err)
    return throwError("oh man - problem")
  }

  searchByName(nameVal, limit) {
    if(!nameVal || nameVal === '') return [];
    return this.afs.collection('user', ref => ref
      .orderBy("displayName_lower")
      .startAt(nameVal.toLowerCase())
      .endAt(nameVal.toLowerCase()+"\uf8ff")
      .limit(limit))
      .valueChanges();
  }

  searchByPhone(phoneVal, limit) {
    return this.afs.collection('user', ref => ref
      .orderBy("phoneNumber")
      .startAt(phoneVal)
      .endAt(phoneVal+"\uf8ff")
      .limit(limit))
      .valueChanges();
  }


  async setFirebaseUser(firebase_auth_currentUser) {
    let user:FirebaseUserModel = this.firebaseUserToFirebaseUserModel(firebase_auth_currentUser);
    this.user = new FirebaseUserModel();
    console.log('setFirebaseUser(): user.uid = ', user.uid);
    var userDoc = await this.afs.collection('user').doc(user.uid).ref.get();
    this.user.populate(userDoc.data());
    console.log('setFirebaseUser(): this.user = ', this.user);
    this.messageService.updateUser(this.user); // how app.component.ts knows we have a user now
  }


  signOut() {
    this.user = null
    this.messageService.updateUser(this.user);
  }

  updateCurrentUser(value: FirebaseUserModel) {
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: value.displayName,
        photoURL: user.photoURL
      }).then( () => {
        // now we have to update the /user node

        this.afs.collection('user').doc(user.uid).ref.update({displayName: value.displayName,
                                   displayName_lower: value.displayName.toLowerCase()});

        this.messageService.updateUser(this.user);
        resolve();
      }, err => reject(err))
    })
  }

  updateUser(value: FirebaseUserModel) {
    return this.afs.collection('user').doc(value.uid).ref
      .update({displayName: value.displayName,
               displayName_lower: value.displayName.toLowerCase(),
               isDisabled: value.isDisabled});
  }
}
