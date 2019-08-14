import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MinimalAccountInfoComponent } from './minimal-account-info.component';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/#/getting-started
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user/user.service';
import { Observable } from 'rxjs/Observable';
import { Router } from "@angular/router";
import {BehaviorSubject, of} from 'rxjs';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';


describe('MinimalAccountInfoComponent', () => {
  let component: MinimalAccountInfoComponent;
  let fixture: ComponentFixture<MinimalAccountInfoComponent>;

    const AngularFirestoreStub = {
        collection: (name: string, f: (ref:any) => {}) => ({
          doc: (_id: string) => ({
            valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
            set: (_d: any) => new Promise((resolve, _reject) => resolve()),
          }),
          valueChanges: () => of([{id: '1', event: 'event1', date: {toDate: () => new Date()}}, // 2 mock LogEntry's
                                  {id: '2', event: 'event2', date: {toDate: () => new Date()}}])
        }),
      };



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinimalAccountInfoComponent ],
      imports: [ FormsModule, NgbModule],
      providers: [
                  UserService,
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                  {provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} },
                  {provide: AngularFirestore, useValue: AngularFirestoreStub},
                  {provide: ActivatedRoute,
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
    fixture = TestBed.createComponent(MinimalAccountInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
