import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule/*, ReactiveFormsModule, FormBuilder*/ } from '@angular/forms';
import { MyAccountComponent } from './my-account.component';
import { UserService } from '../user/user.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, of } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { RoundProgressModule }  from 'angular-svg-round-progressbar';
import { PhonePipe } from '../util/phone/phone.pipe';


// TODO FIXME test
xdescribe('MyAccountComponent', () => {
  let component: MyAccountComponent;
  let fixture: ComponentFixture<MyAccountComponent>;

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, RoundProgressModule ],
      declarations: [ MyAccountComponent, PhonePipe ],
      providers: [ UserService,
                  { provide: AngularFireStorage, useValue: {}},
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('MyAccountComponent: begin')
    expect(component).toBeTruthy();
    console.log('MyAccountComponent: end')
  });
});
