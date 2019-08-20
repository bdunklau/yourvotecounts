import { TestBed } from '@angular/core/testing';
import { SmsService } from './sms.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/#/getting-started


describe('SmsService', () => {

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
                       { provide: HttpClient, useValue: {} },
                       { provide: AngularFireAuth, useValue: {} },
                        {provide: AngularFirestore, useValue: AngularFirestoreStub},
                      ]
       }).compileComponents();
    }
  );


  it('should be created', () => {
    const service: SmsService = TestBed.get(SmsService);
    expect(service).toBeTruthy();
  });
});
