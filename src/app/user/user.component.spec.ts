import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserComponent } from './user.component';
import { HttpClientModule }    from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import {BehaviorSubject} from 'rxjs';

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


describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  const fakeActivatedRoute = {
    data: { "mock2": "mock2", subscribe: () => {}, url: "" },
    snapshot: { data: { "mock1": "mock" } }
  } as ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      declarations: [ UserComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [AuthService,Location,
                    { provide: LocationStrategy, useClass: PathLocationStrategy },
                    {provide: ActivatedRoute, useValue: fakeActivatedRoute},
                    { provide: AngularFireAuth, useValue: FirestoreStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
