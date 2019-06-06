import { NgModule, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from './user.service';
import { FirebaseUserModel } from './user.model'

// I'd recommend you put this service in a subfolder.
// This time, I created a class instead of a json.
// It is because, your other components may require more 'mocked' functions.
// It may be harder to maintain them within a json.
@Injectable()
export class AngularFirestoreStub {
    collection(someString) {
        // return mock collection;
    }

    valueChanges() {}
}

@Injectable()
export class UserServiceStub {
  constructor(
    public db: AngularFirestore,
    public afAuth: AngularFireAuth
  ){}

  getCurrentUser() {
    let user = new FirebaseUserModel()
    user.displayName = "Brent Dunklau"
    user.phoneNumber = "214-555-1212"
    return user
  }

  updateCurrentUser(value) { }
}

@NgModule({
    providers: [{provide: AngularFirestore, useClass: AngularFirestoreStub},
                {provide: UserService, useClass: UserServiceStub}]
})
export class CommonServiceModuleStub {}
