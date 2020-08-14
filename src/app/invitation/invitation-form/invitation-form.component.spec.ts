import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { InvitationFormComponent } from './invitation-form.component';
import { BehaviorSubject, of } from 'rxjs';
import { UserService } from '../../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import { RouterTestingModule } from '@angular/router/testing';
import {
  AbstractControl ,
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
} from "@angular/forms";

describe('InvitationFormComponent', () => {
  let component: InvitationFormComponent;
  let fixture: ComponentFixture<InvitationFormComponent>;
  

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


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [ InvitationFormComponent ],
      providers: [ UserService, FormBuilder,      
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} },
                  { provide: AngularFireStorage, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub }, ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
