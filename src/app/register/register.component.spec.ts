import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { AuthService } from '../core/auth.service'
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import {CommonServiceModuleStub, AngularFireAuthStub} from '../core/common.module'
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs/observable/of';


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;


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
      imports: [ ReactiveFormsModule, FormsModule, CommonServiceModuleStub ],
      providers: [AuthService, FormBuilder,
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); }  },
                  { provide: AngularFireAuth, useValue: AngularFireAuthStub },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub }
                ],
      declarations: [ RegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
