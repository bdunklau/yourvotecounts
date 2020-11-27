import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { InvitationDetailsComponent } from './invitation-details.component';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';
import { UserService } from '../../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from "@angular/router";
import { PhonePipe } from '../../util/phone/phone.pipe';
import { Invitation } from '../../invitation/invitation.model';


// TODO FIXME test
xdescribe('InvitationDetailsComponent', () => {
  let component: InvitationDetailsComponent;
  let fixture: ComponentFixture<InvitationDetailsComponent>;

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
                              {id: '2', event: 'event2', date: {toDate: () => new Date()}}]) // THIS IS NOT WHAT WE WANT TO MOCK HERE.
                              // This was taken from log.component.spec.ts
    }),
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitationDetailsComponent, PhonePipe ],
      providers: [ UserService, Invitation,
          { provide: HttpClient, useClass: class { get = jasmine.createSpy("get"); } },    
          { provide: AngularFireAuth, useValue: {} },   
          { provide: AngularFireStorage, useValue: {} }, 
          { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },    
          {
            provide: ActivatedRoute,
            useValue: {
              data: of({invitation: new Invitation()})
            },
          },
          { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
