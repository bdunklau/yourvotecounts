import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';


describe('SettingsService', () => {

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
      // declarations: [ LogFormComponent ],
      // imports: [ FormsModule/*, NgbModule*/],
      providers: [
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                ],
    })
    .compileComponents();
  });



  it('should be created', () => {
    console.log('SettingsService: begin')
    const service: SettingsService = TestBed.get(SettingsService);
    expect(service).toBeTruthy();
    console.log('SettingsService: end')
  });
});
