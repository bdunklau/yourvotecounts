import { TestBed, async, /*inject*/ } from '@angular/core/testing';
import { PrivacyPolicyService } from './privacy-policy.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';


describe('PrivacyPolicyService', () => {

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
        // declarations: [ PrivacyPolicyComponent ],
        // imports: [ FormsModule, NgbModule],
        // I used 'useValue' because it is just a json. If it was class, I'd use 'useClass'
        providers: [
                    // UserService,
                    // { provide: HttpClient, useValue: {} },
                    // { provide: AngularFireAuth, useValue: {} },
                     {provide: AngularFirestore, useValue: AngularFirestoreStub},
                   ]
      })
      .compileComponents();
    }));



  it('should be created', () => {
    const service: PrivacyPolicyService = TestBed.get(PrivacyPolicyService);
    expect(service).toBeTruthy();
  });
});
