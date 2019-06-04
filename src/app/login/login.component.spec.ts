import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoginComponent } from './login.component';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
// import { FirebaseOptions, _firebaseAppFactory } from '@angular/fire';
import { AuthService } from '../core/auth.service'
import { AngularFirestore } from '@angular/fire/firestore';
import { InjectionToken } from '@angular/core';
import {CommonServiceModuleStub, AngularFirestoreStub} from '../core/common.module'
import {firebase, firebaseui} from 'firebaseui-angular'
// import { FirebaseAuth } from 'firebase/auth'


const authState = {
  isAnonymous: true,
  uid: '17WvU2Vj58SnTz8v7EqyYYb0WRc2'
} as firebase.User;



// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const mockAngularFireAuth: any = {
  auth: {
    app: {
      options: {
        apiKey: "AIzaSyBIFLpXTPojCoeDmEtzqTWasPN0dozg76w",
        authDomain: "yourvotecounts-bd737.firebaseapp.com",
        databaseURL: "https://yourvotecounts-bd737.firebaseio.com",
        projectId: "yourvotecounts-bd737",
        storageBucket: "yourvotecounts-bd737.appspot.com",
        messagingSenderId: "138171792936",
        appId: "1:138171792936:web:ae02cc1626f17cf2"
      }
    }
  },
  authState: Observable.of(authState),
};


// const FirestoreStub = {
//     collection: (name: string) => ({
//       doc: (_id: string) => ({
//         valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
//         set: (_d: any) => new Promise((resolve, _reject) => resolve()),
//       }),
//     }),
//   };


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonServiceModuleStub],
      declarations: [ LoginComponent ],
        providers: [ { provide: AngularFirestore, useClass: AngularFirestoreStub },
                     { provide: AngularFireAuth, useValue: mockAngularFireAuth },
                     { provide: firebaseui.auth.AuthUI, useValue: jasmine.createSpyObj('auth', ['foo'])},
                     // { provide: AngularFireAuth, useClass: class {app: 'bar'} },
                     // { provide: FirebaseAuth, useClass: class {auth = jasmine.createSpy("auth");} },
                     ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
