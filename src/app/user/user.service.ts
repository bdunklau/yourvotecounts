import { Injectable } from "@angular/core";
// import 'rxjs/add/operator/toPromise';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/auth'

// TODO FIXME https://angular.io/guide/http
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { FirebaseUserModel } from '../user/user.model';
import 'rxjs/add/operator/map'
import { MessageService } from '../core/message.service';
import { Team } from '../team/team.model';
import { map } from 'rxjs/operators';
import { Subject, /*Observable,*/ Subscription } from 'rxjs';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { environment } from '../../environments/environment';


@Injectable()
export class UserService {

  user: FirebaseUserModel;

  constructor(
    private afs: AngularFirestore,
    private http: HttpClient,
    public afAuth: AngularFireAuth,
    private messageService: MessageService,
    private afStorage: AngularFireStorage,
    // can't inject LogService because UserService is injected INTO LogService
  ) { 
      
      firebase.auth().onAuthStateChanged(async user => {
          // console.log('watch: ngOnInit: onAuthStateChanged(): user = ', user)
          if(user) {
              let online = true
              // this.setFirebaseUser(user, online);
              await this.signIn(/*this.log,*/ user); // circular dependency - can't inject log service            
          }
          else {
              // user logged out
          }
      })
  }

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

  ///////////////////////////////////////////////////////////////////////
  // may not be useful if angular universal makes us get rid of promises in favor of observables
  // we'll see...   10.1.20
  async getCurrentUser() : Promise<FirebaseUserModel> {
    if(this.user) {
      return this.user
    }
    var user
    try {
        user = await this.createFirebaseUserModel()
    } catch(e) {
        console.log('probably user not logged in?... error: ', e)
    }

    if(!user) {
      return null;
    }

    return new Promise<FirebaseUserModel>(async (resolve, reject) => {
        var userDoc = await this.afs.collection('user').doc(user.uid).ref.get();
        this.user = user;
        this.user.populate(userDoc.data());
        
        if(this.user.photoFileName) {
            console.log('watch: this.user.photoFileName:  '+this.user.photoFileName)
            let photoURL = await this.afStorage.storage.refFromURL('gs://'+environment.firebase.storageBucket+'/'+this.user.photoFileName).getDownloadURL()
            this.user.photoURL = photoURL
        }

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


  async setFirebaseUser(firebase_auth_currentUser, online: boolean) {
    let user:FirebaseUserModel = this.firebaseUserToFirebaseUserModel(firebase_auth_currentUser);
    this.user = new FirebaseUserModel();
    var userDoc = await this.afs.collection('user').doc(user.uid).ref.get();
    // what if brand new user?

    console.log('setFirebaseUser(): userDoc = ', userDoc);
    console.log('setFirebaseUser(): userDoc.data() = ', userDoc.data());
    this.user.populate(userDoc.data());

    await this.afStorage.storage
    .refFromURL('gs://'+environment.firebase.storageBucket+'/'+this.user.photoFileName)
    .getDownloadURL().then(url => {
        console.log("this.photoURL = ", url)
        this.user.photoURL = url
        this.messageService.updateUser(this.user) // see app.component.ts:ngOnInit()
     })

    this.user.online = online;
    this.updateUser(this.user); // saves the online state
    console.log('setFirebaseUser(): this.user = ', this.user);
    this.messageService.updateUser(this.user); // how app.component.ts knows we have a user now
  }


  async signIn(/*log: LogService,*/ firebase_auth_currentUser) {
    await this.setFirebaseUser(firebase_auth_currentUser, true);
    // this.log.i('login');
  }


  signOut() {
    let user = new FirebaseUserModel();
    this.user.online = false;
    user.populate(this.user);
    return this.updateUser(user);
  }

  subscribe(uid: string, fn: ((users:[FirebaseUserModel]) => void) ): Subscription {
    const sub = this.afs.collection('user', ref => ref.where("uid", "==", uid))
          .snapshotChanges()
          .pipe( // see team-list.component.ts
            map(actions => { // actions = [{},{type:"added", payload:{}}]
              return actions.map(a => {
                const data = a.payload.doc.data();
                let u = new FirebaseUserModel();
                u.populate(data);
                return u;
                // const id = a.payload.doc.id;  // valid but not needed here
              });
            })
          )
          .subscribe(fn);
    console.log('subscribe: sub = ', sub);
    return sub;
  }

  updateCurrentUser(value: FirebaseUserModel) {
    console.log("updateCurrentUser: value = ", value)
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: value.displayName,
        photoURL: value.photoURL
      }).then( () => {
        // now we have to update the /user node

        this.afs.collection('user').doc(user.uid).ref
                .update({displayName: value.displayName,
                         displayName_lower: value.displayName.toLowerCase(),
                         photoURL: value.photoURL,
                         photoFileName: value.photoFileName});

        this.messageService.updateUser(this.user);
        resolve();
      }, err => reject(err))
    })
  }



  // TODO This is what we SHOULD be doing instead of my-account.component.ts:upload()
  // but kept getting compile errors like:
  //   'UploadTaskSnapshot' is not assignable to type 'AngularFireUploadTask'
  //
  // async updatePhoto(value: FirebaseUserModel) {
  //   const user = await this.getCurrentUser();
  //   const ref = this.afStorage.ref('profile-pic-'+user.uid);
  //   await ref.delete();
  //   await this.afStorage.ref('thumb_profile-pic-'+user.uid);
  //   return ref.put(event.target.files[0]);
  // }



  // TODO FIXME this doesn't look right.  Not actually updating user object in Authentication
  // Is there a trigger maybe that keeps both user objects in sync?  Find out.  8/21/19
  async updateUser(value: FirebaseUserModel) {
    let data = {}
    if(value.displayName) {
      data['displayName'] = value.displayName;
      data['displayName_lower'] = value.displayName.toLowerCase();
    }
    data['isDisabled'] = value.isDisabled;
    data['online'] = value.online === true ? true : false;
    data['tosAccepted'] = value.tosAccepted === true ? true : false;
    data['privacyPolicyRead'] = value.privacyPolicyRead === true ? true : false;
    let updateRes = this.afs.collection('user').doc(value.uid).ref.update(data);
    console.log('updateUser: DATABASE UPDATE: ', data);
    return updateRes;
  }

  addGuest(guest: {displayName: string, phoneNumber: string, invitationId: string}) {
    this.afs.collection('guest').doc(guest.phoneNumber).set(guest);
  }


    async setPromoCode(user: FirebaseUserModel) {
        await this.afs.collection('user').doc(user.uid).update({promo_code: user.promo_code})
    }

}
