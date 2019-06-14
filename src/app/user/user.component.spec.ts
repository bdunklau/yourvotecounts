import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { HttpClientModule }    from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import {BehaviorSubject} from 'rxjs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

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

  // const fakeActivatedRoute = {
  //   data: { "mock2": "mock2", subscribe: () => {}, "url": "" },
  //   snapshot: { data: { "mock1": "mock" } }
  // } as ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      declarations: [ UserComponent ],
      providers: [AuthService,Location,
                    { provide: AngularFireAuth, useValue: FirestoreStub/*TODO isn't right*/ },
                    { provide: LocationStrategy, useClass: PathLocationStrategy },
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
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
