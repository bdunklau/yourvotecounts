import { TestBed, async, inject } from '@angular/core/testing';
import { UserService } from '../user/user.service';
import { DisabledGuard } from './disabled.guard';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from "@angular/router";
import { BehaviorSubject, of } from 'rxjs';


describe('DisabledGuard', () => {

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
                                {id: '2', event: 'event2', date: {toDate: () => new Date()}}]),
        snapshotChanges: () => ({
          pipe: (xxx) => {}
        })
      }),
    };


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisabledGuard, UserService,
                  { provide: AngularFireStorage, useValue: {}},
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} }
                ]
    });
  });

  it('should ...', inject([DisabledGuard], (guard: DisabledGuard) => {
    console.log('DisabledGuard: begin')
    expect(guard).toBeTruthy();
    console.log('DisabledGuard: end')
  }));
});
