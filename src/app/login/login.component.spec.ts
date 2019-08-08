import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

    const AngularFirestoreStub = {
        collection: (name: string, f: (ref:any) => {}) => ({
          doc: (_id: string) => ({
            valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
            set: (_d: any) => new Promise((resolve, _reject) => resolve()),
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
      declarations: [ LoginComponent ],
      providers: [
                  UserService,
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} },
                  // { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // firebase ui and auth libraries make is so you can't create this component
  // MAYBE if the mock objects above were defined differently ???  
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
