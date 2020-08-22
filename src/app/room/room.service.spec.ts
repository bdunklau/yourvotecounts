import { TestBed } from '@angular/core/testing';
import { RoomService } from './room.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';


describe('RoomService', () => {
  let service: RoomService;
  
  // FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
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
                              {id: '2', event: 'event2', date: {toDate: () => new Date()}}])
    }),
    createId: function() { return "someid" }
  };



  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ //UserService,
        //{ provide: AngularFireStorage, useValue: {}},
        //{ provide: HttpClient, useValue: {} },
        //{ provide: AngularFireAuth, useValue: {} },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        //{ provide: AngularFireStorage, useValue: {}},
      ]

    });
    service = TestBed.inject(RoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
