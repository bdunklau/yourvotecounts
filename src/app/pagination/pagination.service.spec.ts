import { TestBed } from '@angular/core/testing';
import { PaginationService } from './pagination.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';


describe('PaginationService', () => {


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


  beforeEach(
      async () => {
         TestBed.configureTestingModule({
             // imports: [CommonServiceModuleStub],
             // I used 'useValue' because it is just a json. If it was class, I'd use 'useClass'
             providers: [
                         {provide: AngularFirestore, useValue: AngularFirestoreStub},
                         // {provide: AngularFireAuth, useValue: mockAngularFireAuth}
                       ],
             // schemas: [ NO_ERRORS_SCHEMA ],
             // declarations: [ AppComponent ]
         }).compileComponents();

         // db = TestBed.get(AngularFirestore);
         // userService = TestBed.get(UserService);
      }
  );


  it('should be created', () => {
    console.log('PaginationService: begin')
    const service: PaginationService = TestBed.get(PaginationService);
    expect(service).toBeTruthy();
    console.log('PaginationService: end')
  });
});
