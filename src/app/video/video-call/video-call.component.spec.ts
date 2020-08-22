import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoCallComponent } from './video-call.component';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';
import { UserService } from '../../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { RoomService } from '../../room/room.service';


describe('VideoCallComponent', () => {
  let component: VideoCallComponent;
  let fixture: ComponentFixture<VideoCallComponent>;

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
      declarations: [ VideoCallComponent ],
      providers: [ UserService, RoomService,
          {provide: ActivatedRoute,
            useValue: {
              params: Observable.from([{id: 1}]),
              data: { "mock2": "mock2", subscribe: () => {} }
            },
          },
          { provide: HttpClient, useValue: {} },
          { provide: AngularFireAuth, useValue: {} },
          { provide: AngularFireStorage, useValue: {} },
          { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
