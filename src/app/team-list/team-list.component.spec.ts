import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TeamListComponent } from './team-list.component';
import { Observable, /*of, Subject, Subscription*/ } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseUserModel } from '../user/user.model';
import { map/*, take*/ } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';

// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const FirestoreStub = {
    collection: (name: string) => ({
      doc: (_id: string) => ({
        valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
        set: (_d: any) => new Promise((resolve, _reject) => resolve()),
      }),

      snapshotChanges: () => ({
        pipe: (/*m: map*/) => ({
          subscribe: () => {}
        })
      }),
    }),
  };




describe('TeamListComponent', () => {
  let component: TeamListComponent;
  let fixture: ComponentFixture<TeamListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamListComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [FirebaseUserModel, UserService,
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} },
                  {
                    provide: ActivatedRoute,
                    useValue: {
                      params: Observable.from([{id: 1}]),
                      data: { "mock2": "mock2", subscribe: () => {} }
                    },
                  },
                  {provide: AngularFirestore, useValue: FirestoreStub},
                ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
