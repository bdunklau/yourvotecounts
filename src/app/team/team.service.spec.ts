import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { TeamService } from './team.service';
import { BehaviorSubject, of } from 'rxjs';
import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';



describe('TeamService', () => {

  // FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
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


  beforeEach(() => TestBed.configureTestingModule({
    providers: [ UserService,
                { provide: AngularFireStorage, useValue: {}},
                { provide: HttpClient, useValue: {} },
                { provide: AngularFireAuth, useValue: {} },
                {provide: AngularFirestore, useValue: AngularFirestoreStub}
              ]
  }));

  it('should be created', () => {
    const service: TeamService = TestBed.get(TeamService);
    expect(service).toBeTruthy();
  });
});
