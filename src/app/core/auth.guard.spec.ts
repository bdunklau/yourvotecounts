import { AuthGuard } from './auth.guard';
import { UserService } from './user.service';
import { TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { Router } from "@angular/router";
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import { FirebaseUserModel } from './user.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonServiceModuleStub } from './common.module';

// from:   https://atom-morgan.github.io/how-to-test-angular-canactivate-guards/
class MockRouter {
  navigate(path) {
    console.log("MockRouter: path = ", path)
  }
}

const data = Observable.from([{image: "img1", displayName: "Brent Dunklau", provider: "", phoneNumber: "214-555-1212"}]);

const collectionStub = {
  valueChanges: jasmine.createSpy('valueChanges').and.returnValue(data)
}

const angularFirestoreStub = {
  collection: jasmine.createSpy('collection').and.returnValue(collectionStub)
}

describe('AuthGuard', () => {
  describe('canActivate', () => {
    let authGuard: AuthGuard;
    let router;
    let userService: UserService;
    let db: AngularFirestore;
    let afAuth: AngularFireAuth;

    const authState = new FirebaseUserModel();

    const mockAngularFireAuth: any = {
      auth: jasmine.createSpyObj('auth', {
        'signInAnonymously': Promise.reject({
          code: 'auth/operation-not-allowed'
        }),
        // 'signInWithPopup': Promise.reject(),
        // 'signOut': Promise.reject()
      }),
      authState: Observable.of(authState)
    };

    beforeEach(
        async () => {
           TestBed.configureTestingModule({
               imports: [CommonServiceModuleStub],
               // I used 'useValue' because it is just a json. If it was class, I'd use 'useClass'
               providers: [{provide: AngularFirestore, useValue: angularFirestoreStub},
                           {provide: AngularFireAuth, useValue: mockAngularFireAuth}],
               schemas: [ NO_ERRORS_SCHEMA ],
               declarations: [ AppComponent ]
           }).compileComponents();

           db = TestBed.get(AngularFirestore);
           userService = TestBed.get(UserService);
        }
    );

    it('should navigate to user for a logged in user', async () => {
      spyOn(userService, 'getCurrentUser').and.returnValue({displayName: "Bob Meader", phoneNumber: "469-555-0000"});
      router = new MockRouter();
      authGuard = new AuthGuard(userService, router);
      spyOn(router, 'navigate');
      let canAct = await authGuard.canActivate()
      expect(canAct).toBeFalsy();
      expect(router.navigate.calls.count()).toEqual(1)
      expect(router.navigate).toHaveBeenCalledWith(['/user']);
    });


    // failed
    it('should return true for a logged out user', async () => {
      router = new MockRouter();
      spyOn(userService, 'getCurrentUser').and.returnValue(null);
      authGuard = new AuthGuard(userService, router);
      let res = await authGuard.canActivate();
      expect(res).toBeTruthy();
    });


  });
});
