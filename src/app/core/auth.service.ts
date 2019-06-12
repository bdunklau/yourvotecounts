import { Injectable } from "@angular/core";
//import 'rxjs/add/operator/toPromise';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { LogService } from '../log/log.service'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {

  constructor(
    public db: AngularFirestore,
    public afAuth: AngularFireAuth,
    private log: LogService,
    private userService: UserService
 ){}

  doPhoneLogin() {
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.PhoneAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doFacebookLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doTwitterLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.TwitterAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doGoogleLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doRegister(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
      .then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }

  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
      .then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }

  doLogout(){
    return new Promise(async (resolve, reject) => {
      if(firebase.auth().currentUser){
        await this.log.i({event: 'logout', uid: firebase.auth().currentUser.uid, phoneNumber: firebase.auth().currentUser.phoneNumber})
        this.afAuth.auth.signOut();
        this.userService.signOut();
        resolve();
      }
      else{
        await this.log.i({event: 'logout - no current user', uid: "uid n/a", phoneNumber: "ph n/a"})
        resolve();
      }
    });
  }


}
