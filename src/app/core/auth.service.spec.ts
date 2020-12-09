import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { BehaviorSubject, of } from 'rxjs';
import { UserService } from '../user/user.service'
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';


// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const FirestoreStub = {
    collection: (name: string) => ({
      doc: (_id: string) => ({
        valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
        set: (_d: any) => new Promise((resolve, _reject) => resolve()),
        ref: {
          get: () => ({
            data: () => ({
              text: 'mock data',
            }),
          }),
        }
      }),
    }),
  };

describe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [AuthService, UserService,
                { provide: AngularFireStorage, useValue: {}},
                { provide: HttpClient, useValue: {} },
                { provide: AngularFireAuth, useValue: {} },
                { provide: AngularFirestore, useValue: FirestoreStub }]
  }));

  it('should be created', () => {
    console.log('AuthService: begin')
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
    console.log('AuthService: end')
  });
});
