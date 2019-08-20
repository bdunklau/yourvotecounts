import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TokenComponent } from './token.component';
import { UserService } from '../user/user.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import {CommonServiceModuleStub, AngularFireAuthStub} from '../core/common.module';
import { BehaviorSubject, of } from 'rxjs';


describe('TokenComponent', () => {
  let component: TokenComponent;
  let fixture: ComponentFixture<TokenComponent>;

    // a stub/mock
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
      };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, FormsModule, CommonServiceModuleStub ],
      providers: [ UserService,
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: AngularFireAuthStub },
                  { provide: HttpClient, useValue: {} }
                 ],
      declarations: [ TokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
