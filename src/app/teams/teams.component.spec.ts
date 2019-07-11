import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { /*Component, DebugElement,*/ NO_ERRORS_SCHEMA } from '@angular/core';
import { TeamsComponent } from './teams.component';
import { UserService } from '../user/user.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';


// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const FirestoreStub = {
    collection: (name: string) => ({
      doc: (_id: string) => ({
        valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
        set: (_d: any) => new Promise((resolve, _reject) => resolve()),
      }),
    }),
  };


describe('TeamsComponent', () => {
  let component: TeamsComponent;
  let fixture: ComponentFixture<TeamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [UserService,
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} },
                  {provide: AngularFirestore, useValue: FirestoreStub},
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
    expect(component).toBeTruthy();
  });
});
