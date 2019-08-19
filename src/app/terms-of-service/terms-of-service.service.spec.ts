import { TestBed } from '@angular/core/testing';
import { TermsOfServiceService } from './terms-of-service.service';
import { AngularFirestore } from '@angular/fire/firestore';
import {BehaviorSubject, of} from 'rxjs';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from "@angular/router";
import { UserService } from '../user/user.service';


describe('TermsOfServiceService', () => {

  const AngularFirestoreStub = {
      collection: (name: string, f: (ref:any) => {}) => ({
        doc: (_id: string) => ({
          valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
          set: (_d: any) => new Promise((resolve, _reject) => resolve()),
          ref: {
            get: () => {}
          }
        }),
        valueChanges: () => of([{id: '1', event: 'event1', date: {toDate: () => new Date()}}, // 2 mock LogEntry's
                                {id: '2', event: 'event2', date: {toDate: () => new Date()}}])
      }),
    };


  beforeEach(() => {
    TestBed.configureTestingModule({
      // I used 'useValue' because it is just a json. If it was class, I'd use 'useClass'
      providers: [ UserService,
                   { provide: HttpClient, useValue: {} },
                   { provide: AngularFireAuth, useValue: {} },
                   {provide: AngularFirestore, useValue: AngularFirestoreStub},
                   { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); }  },
                 ]
    });
  });


  it('should be created', () => {
    const service: TermsOfServiceService = TestBed.get(TermsOfServiceService);
    expect(service).toBeTruthy();
  });
});
