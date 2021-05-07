import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import { SearchUserByName2Component } from './search-user-by-name2.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../user/user.service';
import {CommonServiceModuleStub} from '../../core/common.module';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, /*of, Subject, Subscription*/ } from 'rxjs';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, of } from 'rxjs';

// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const FirestoreStub = {
    collection: (name: string) => ({
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
    }),
  };


describe('SearchUserByName2Component', () => {
  let component: SearchUserByName2Component;
  let fixture: ComponentFixture<SearchUserByName2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchUserByName2Component ],
      imports: [ FormsModule, NgbModule, CommonServiceModuleStub],
      providers: [UserService,
                  { provide: AngularFireStorage, useValue: {}}, 
                  {provide: AngularFirestore, useValue: FirestoreStub},
                  {provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} },
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
    fixture = TestBed.createComponent(SearchUserByName2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('SearchUserByName2Component: begin')
    expect(component).toBeTruthy();
    console.log('SearchUserByName2Component: end')
  });
});
