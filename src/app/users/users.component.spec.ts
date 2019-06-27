import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { UsersComponent } from './users.component';
// import {CommonServiceModuleStub, AngularFirestoreStub} from '../core/common.module'
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { UserService } from '../user/user.service'
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { SearchUserByNameComponent } from '../search/search-user-by-name/search-user-by-name.component';
import { SearchUserByPhoneComponent } from '../search/search-user-by-phone/search-user-by-phone.component';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';


describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  const AngularFirestoreStub = {
      collection: (name: string, f: (ref:any) => {}) => ({
        doc: (_id: string) => ({
          valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
          set: (_d: any) => new Promise((resolve, _reject) => resolve()),
        }),
        valueChanges: () => of([{id: '1', event: 'event1', date: {toDate: () => new Date()}}, // 2 mock LogEntry's
                                {id: '2', event: 'event2', date: {toDate: () => new Date()}}]) // THIS IS NOT WHAT WE WANT TO MOCK HERE.
                                // This was taken from log.component.spec.ts
      }),
    };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [/*CommonServiceModuleStub,*/ FormsModule, NgbModule],
      declarations: [ UsersComponent, SearchUserByNameComponent, SearchUserByPhoneComponent ],
      providers: [ UserService,
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} }
                ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
