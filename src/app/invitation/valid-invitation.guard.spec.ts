import { TestBed } from '@angular/core/testing';
import { ValidInvitationGuard } from './valid-invitation.guard';
import { AngularFirestore } from '@angular/fire/firestore';
import {BehaviorSubject, of} from 'rxjs';
import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from "@angular/router";


describe('ValidInvitationGuard', () => {
  let guard: ValidInvitationGuard;

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
                              {id: '2', event: 'event2', date: {toDate: () => new Date()}}]) // THIS IS NOT WHAT WE WANT TO MOCK HERE.
                              // This was taken from log.component.spec.ts
    }),
  };


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ //MinimalAccountInfoGuard,
                   UserService,
                   { provide: AngularFireStorage, useValue: {}},
                   { provide: HttpClient, useValue: {} },
                   { provide: AngularFireAuth, useValue: {} },
                   { provide: AngularFirestore, useValue: AngularFirestoreStub },
                   { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); }  }
                ]
    });
    guard = TestBed.inject(ValidInvitationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
