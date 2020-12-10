import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { /*Component, DebugElement,*/ NO_ERRORS_SCHEMA } from '@angular/core';
import { TeamsComponent } from './teams.component';
import { UserService } from '../user/user.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject, of } from 'rxjs';



describe('TeamsComponent', () => {
  let component: TeamsComponent;
  let fixture: ComponentFixture<TeamsComponent>;

    // a stub/mock
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


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [UserService,
                  { provide: AngularFireStorage, useValue: {}},
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} },
                  {provide: AngularFirestore, useValue: AngularFirestoreStub},
                  {
                    provide: ActivatedRoute,
                    useValue: {
                      params: Observable.from([{id: 1}]),
                      data: { "mock2": "mock2", subscribe: () => {} }
                    },
                  },
                ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('TeamsComponent: begin')
    expect(component).toBeTruthy();
    console.log('TeamsComponent: end')
  });
});
