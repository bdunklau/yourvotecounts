import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from '../../user/user.service';
import { InvitationListComponent } from './invitation-list.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/storage';

describe('InvitationListComponent', () => {
  let component: InvitationListComponent;
  let fixture: ComponentFixture<InvitationListComponent>;

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
                                {id: '2', event: 'event2', date: {toDate: () => new Date()}}]), // THIS IS NOT WHAT WE WANT TO MOCK HERE.
        snapshotChanges: () => ({
          pipe: (xxx) => {}
        })
      }),
    };

    const AngularFireAuthStub = {}

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitationListComponent ],
      providers: [ UserService, 
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: AngularFireStorage, useValue: {}},
        { provide: AngularFireAuth, useValue: AngularFireAuthStub },
        { provide: HttpClient, useValue: {} },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
