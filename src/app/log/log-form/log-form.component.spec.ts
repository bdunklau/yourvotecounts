import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import { LogFormComponent } from './log-form.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserService } from '../../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';


describe('LogFormComponent', () => {
  let component: LogFormComponent;
  let fixture: ComponentFixture<LogFormComponent>;

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

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [ LogFormComponent, LoadingSpinnerComponent ],
      imports: [ FormsModule/*, NgbModule*/],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ UserService,
                  { provide: AngularFireStorage, useValue: {}},
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} },
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                  // { provide: AngularFireAuth, useValue: {} }
                ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
