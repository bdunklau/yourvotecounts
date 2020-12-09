import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from '../user/user.service';
import { DisabledComponent } from './disabled.component';
import { Router } from "@angular/router";
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';



describe('DisabledComponent', () => {
  let component: DisabledComponent;
  let fixture: ComponentFixture<DisabledComponent>;

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
      declarations: [ DisabledComponent ],
      providers: [UserService, 
                  { provide: AngularFireStorage, useValue: {}}, 
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} },
                  { provide: HttpClient, useValue: {} },
                ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisabledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('DisabledComponent: begin')
    expect(component).toBeTruthy();
    console.log('DisabledComponent: end')
  });
});
