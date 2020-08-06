import { TestBed } from '@angular/core/testing';
import { LogService } from './log.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';

import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';


// // from:   https://atom-morgan.github.io/how-to-test-angular-canactivate-guards/
// class MockRouter {
//   navigate(path) {
//     console.log("MockRouter: path = ", path)
//   }
// }

describe('LogService', () => {

  const AngularFirestoreStub = {
      collection: (name: string, f: (ref:any) => {}) => ({
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
        valueChanges: () => of([{id: '1', event: 'event1', date: {toDate: () => new Date()}}, // 2 mock LogEntry's
                                {id: '2', event: 'event2', date: {toDate: () => new Date()}}])
      }),
    };

  beforeEach(
      async () => {
         TestBed.configureTestingModule({
             // I used 'useValue' because it is just a json. If it was class, I'd use 'useClass'
             providers: [ UserService,
                         { provide: AngularFireStorage, useValue: {}},
                         { provide: HttpClient, useValue: {} },
                         { provide: AngularFireAuth, useValue: {} },
                          {provide: AngularFirestore, useValue: AngularFirestoreStub},
                        ]
         }).compileComponents();
      }
  );

  it('should be created', () => {
    const service: LogService = TestBed.get(LogService);
    expect(service).toBeTruthy();
  });
});
