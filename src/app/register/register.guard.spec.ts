import { TestBed, async, inject } from '@angular/core/testing';
import { UserService } from '../core/user.service'
import { RegisterGuard } from './register.guard';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { CommonServiceModuleStub, AngularFireAuthStub } from '../core/common.module'
import { CanActivate, Router } from "@angular/router";
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs/observable/of';

describe('RegisterGuard', () => {


  const AngularFirestoreStub = {
      collection: (name: string, f: (ref:any) => {}) => ({
        doc: (_id: string) => ({
          valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
          set: (_d: any) => new Promise((resolve, _reject) => resolve()),
        }),
        valueChanges: () => of([{id: '1', event: 'event1', date: {toDate: () => new Date()}}, // 2 mock LogEntry's
                                {id: '2', event: 'event2', date: {toDate: () => new Date()}}]) // THIS IS NOT WHAT WE WANT TO MOCK HERE.
                                // This was taken from log.component.spec.ts
      }),
    };


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegisterGuard, UserService,
                { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); }  },
                { provide: AngularFirestore, useValue: AngularFirestoreStub },
                {provide: AngularFireAuth, useClass: AngularFireAuthStub}]
    });
  });

  it('should ...', inject([RegisterGuard], (guard: RegisterGuard) => {
    expect(guard).toBeTruthy();
  }));
});
