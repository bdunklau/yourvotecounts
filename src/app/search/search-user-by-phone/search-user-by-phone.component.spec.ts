import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SearchUserByPhoneComponent } from './search-user-by-phone.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/#/getting-started
import { UserService } from '../../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';


describe('SearchUserByPhoneComponent', () => {
  let component: SearchUserByPhoneComponent;
  let fixture: ComponentFixture<SearchUserByPhoneComponent>;

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


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgbModule],
      declarations: [ SearchUserByPhoneComponent ],
      providers: [ UserService,
                  { provide: AngularFireStorage, useValue: {}},
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} }
                ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchUserByPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('SearchUserByPhoneComponent: begin')
    expect(component).toBeTruthy();
    console.log('SearchUserByPhoneComponent: end')
  });
});
