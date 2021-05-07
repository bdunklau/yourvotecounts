import { TestBed } from '@angular/core/testing';
import { InvitationDeletedGuard } from './invitation-deleted.guard';
import { BehaviorSubject, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserService } from '../../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../../../src/environments/environment';
import { RouterTestingModule } from '@angular/router/testing';



describe('InvitationDeletedGuard', () => {
  let guard: InvitationDeletedGuard;
  let userService: UserService;


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

  const AngularFireAuthStub = {}



  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
          RouterTestingModule, //FormsModule, ReactiveFormsModule
          AngularFireModule.initializeApp(environment.firebase),
          // AngularFirestoreModule,
          // ... the rest
      ],
      providers: [ //AuthService, 
                  UserService, 
                  // { provide: AngularFireStorage, useValue: {}},
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: AngularFireAuthStub }
                  ],
    });
    userService = TestBed.get(UserService);
    guard = TestBed.inject(InvitationDeletedGuard);
  });

  it('should be created', () => {
    console.log('InvitationDeletedGuard: begin')
    expect(guard).toBeTruthy();
    console.log('InvitationDeletedGuard: end')
  });
});
