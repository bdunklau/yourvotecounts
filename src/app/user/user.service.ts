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
import { map } from 'rxjs/operators';
import { Subject, /*Observable,*/ Subscription } from 'rxjs';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { environment } from '../../environments/environment';
import { Friend } from '../friend/friend.model';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable()
export class UserService {

  user: FirebaseUserModel;
  userSubscription: Subscription

  constructor(
    private afs: AngularFirestore,
    private http: HttpClient,
    private router: Router,
    public afAuth: AngularFireAuth,
    private messageService: MessageService,
    private afStorage: AngularFireStorage,
    // can't inject LogService because UserService is injected INTO LogService
  ) { 
      
      firebase.auth().onAuthStateChanged(async user => {
          // console.log('watch: ngOnInit: onAuthStateChanged(): user = ', user)
          if(user) {
              this.listenForUser(user)
              this.afs.collection('user').doc(user.uid).update({online: true});

              // await this.signIn(/*this.log,*/ user); // circular dependency - can't inject log service            
          }
          else {
              // user logged out
              if(this.userSubscription) this.userSubscription.unsubscribe()
              delete this.user
              this.messageService.updateUser(null);
          }
      })
  }


  private listenForUser(user /*firebaseUser*/) {
      if(this.userSubscription) this.userSubscription.unsubscribe()

      this.userSubscription = this.subscribe(user.uid, async (users:[FirebaseUserModel]) => {
        if(users && users.length > 0) {          
            this.user = users[0]

            // duplicated/adapted from setFirebaseUser()
            await this.afStorage.storage
            .refFromURL('gs://'+environment.firebase.storageBucket+'/'+this.user.photoFileName)
            .getDownloadURL().then(url => {
                console.log("this.photoURL = ", url)
                /**
                 * prevents e2e test error on logout
                 */
                if(this.user) {
                    this.user.photoURL = url
                    this.messageService.updateUser(this.user) // see app.component.ts:ngOnInit()
                }
            })

            /**
             * prevents e2e test error on logout
             */
            if(this.user) {
                this.user.online = true;            
                // this.updateUser(this.user); // saves the online state    // FIXME circular - don't update user inside userSubscription
                console.log('onAuthStateChanged(): this.user = ', this.user);
                this.messageService.updateUser(this.user); // how app.component.ts knows we have a user now
            }

        }
      })
      
  }

  // ngOnInit() {
  //   // isn't this just for components, not services?
  // }

  // ngOnDestroy() {
  //   // isn't this just for components, not services?
  // }


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

  searchFriends(/*currUser,*/ nameVal, limit) {
    if(!nameVal || nameVal === '' || !this.user) {
        return [];
    }
    return this.afs.collection('friend', ref => ref
      .where("uid1", "==", this.user.uid)  // my friends only, duh
      .orderBy("displayName2_lowerCase")
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
                // const id = a.payload.doc['id'];  // valid but not needed here
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
    if(value.access_expiration_ms) {
        data['access_expiration_ms'] = value.access_expiration_ms
    }
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

    async addFriend(args: {person1: FirebaseUserModel, person2: any}) {

        let now = new Date().getTime()
        let id1 = this.afs.createId()
        let id2 = this.afs.createId()
        let batch = this.afs.firestore.batch()
        let ref1 = this.afs.collection('friend').doc(id1).ref
        let ref2 = this.afs.collection('friend').doc(id2).ref
        // TODO defaults to US if no country code
        let phone1 = args.person1.phoneNumber.startsWith('+') ? args.person1.phoneNumber : '+1'+args.person1.phoneNumber
        let phone2 = args.person2.phoneNumber.startsWith('+') ? args.person2.phoneNumber : '+1'+args.person2.phoneNumber

        let asUser = await this.getUserWithPhone(phone2)  

        let friendEntry = {friendId1: id1,
          displayName1: args.person1.displayName, 
          phoneNumber1: phone1, 
          uid1: args.person1.uid,
          friendId2: id2,
          displayName2: args.person2.displayName,
          displayName2_lowerCase: args.person2.displayName.toLowerCase(),
          phoneNumber2: phone2,
          date_ms: now }

        let reciprocalEntry = {friendId1: id2,
          displayName1: args.person2.displayName, 
          phoneNumber1: phone2,
          friendId2: id1, 
          displayName2: args.person1.displayName,
          displayName2_lowerCase: args.person1.displayName.toLowerCase(),
          phoneNumber2: phone1,
          date_ms: now,
          uid2: args.person1.uid }
        
        if(asUser) {
            friendEntry['displayName2'] = asUser.displayName
            friendEntry['displayName2_lowerCase'] = asUser.displayName.toLowerCase()
            friendEntry['uid2'] = asUser.uid
            reciprocalEntry['displayName1'] = asUser.displayName
            reciprocalEntry['uid1'] = asUser.uid
        }

        batch.set(ref1, friendEntry)
        batch.set(ref2, reciprocalEntry)
        await batch.commit()
    }


    async deleteFriend(friend: Friend) {
        
        let batch = this.afs.firestore.batch()
        let ref1 = this.afs.collection('friend').doc(friend.friendId1).ref
        let ref2 = this.afs.collection('friend').doc(friend.friendId2).ref
        batch.delete(ref1)
        batch.delete(ref2)
        await batch.commit()
    }


    getFriends(user: FirebaseUserModel) {
        return this.afs.collection('friend', ref => ref.where('phoneNumber1', '==', user.phoneNumber).orderBy('displayName2_lowerCase', 'asc').limit(25)).snapshotChanges()
    }


    async getUserWithPhone(phoneNumber: string) {
        console.log('getUserWithPhone(): phoneNumber: ', phoneNumber)
        let userRef = this.afs.collection('user', ref => ref.where('phoneNumber', '==', phoneNumber).limit(1)).snapshotChanges().pipe(take(1))
        let userPromise = await userRef.toPromise()    
        if(!userPromise || userPromise.length == 0) return null   
        let userObj = userPromise[0].payload.doc.data()

        // get photoURL from photoFileName
        if(!userObj['photoFileName']) {
            userObj['photoFileName'] = 'thumb_profile-pic-default.png'
        }
        
        userObj['photoURL'] = await this.afStorage.storage
            .refFromURL('gs://'+environment.firebase.storageBucket+'/'+userObj['photoFileName'])
            .getDownloadURL()

        let theUser = new FirebaseUserModel()
        theUser.populate(userObj);
        return theUser
    }


    async getProfilePicUrl(photoFileName: string) {
      return await this.afStorage.storage
          .refFromURL('gs://'+environment.firebase.storageBucket+'/'+photoFileName)
          .getDownloadURL()
    }


    async getDefaultProfilePicUrl() {
      return this.getProfilePicUrl('thumb_profile-pic-default.png')
      // return await this.afStorage.storage
      //     .refFromURL('gs://'+environment.firebase.storageBucket+'/thumb_profile-pic-default.png')
      //     .getDownloadURL()
    }


    getUsersByDate() {
      return this.afs.collection('user', ref => ref.orderBy('date_ms', 'desc').limit(25)).snapshotChanges()
    }
    

    // getMembersByTeamId(id: string) {
    //   // Observable< DocumentChangeAction <unknown> []>
    //   var retThis = this.afs.collection('team_member', ref => ref.where("teamDocId", "==", id)).snapshotChanges();
    //   return retThis;
    // }


}
