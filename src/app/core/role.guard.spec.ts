import { TestBed, async, inject } from '@angular/core/testing';
import { UserService } from '../user/user.service';
import { RoleGuard } from './role.guard';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';



// from:   https://atom-morgan.github.io/how-to-test-angular-canactivate-guards/
class MockRouter {
  navigate(path) {
    console.log("MockRouter: path = ", path)
  }
}


describe('RoleGuard', () => {

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleGuard, UserService,
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} },
                  { provide: HttpClient, useValue: {} },
                  { provide: Router, useClass: MockRouter }
                ]
    });
  });

  it('should ...', inject([RoleGuard], (guard: RoleGuard) => {
    expect(guard).toBeTruthy();
  }));
});
