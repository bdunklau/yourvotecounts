import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import {CommonServiceModuleStub/*, AngularFirestoreStub*/} from '../core/common.module'
import { LogComponent } from './log.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { BehaviorSubject, of } from 'rxjs';

import { SearchLogByLevelComponent } from '../search/search-log-by-level/search-log-by-level.component';
import { SearchUserByPhoneComponent } from '../search/search-user-by-phone/search-user-by-phone.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/#/getting-started
import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { DateChooserComponent } from '../util/date-chooser/date-chooser.component';
import { SearchUserByNameComponent } from '../search/search-user-by-name/search-user-by-name.component';
import { LogFormComponent } from './log-form/log-form.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';


describe('LogComponent', () => {
  let component: LogComponent;
  let fixture: ComponentFixture<LogComponent>;


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
                                {id: '2', event: 'event2', date: {toDate: () => new Date()}}]),
        snapshotChanges: () => ({
          pipe: (xxx) => {}
        })
      }),
    };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ /*CommonServiceModuleStub, */ FormsModule, ReactiveFormsModule, NgbModule],
      declarations: [ LogComponent, SearchLogByLevelComponent, SearchUserByPhoneComponent,
                      SearchUserByNameComponent, DateChooserComponent, LoadingSpinnerComponent,
                      LogFormComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ UserService, 
                  { provide: AngularFireStorage, useValue: {}},
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} },
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('LogComponent: begin')
    expect(component).toBeTruthy();
    console.log('LogComponent: end')
  });
});
