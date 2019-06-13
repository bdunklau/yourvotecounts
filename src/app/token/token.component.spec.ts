import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { /*Component, DebugElement,*/ NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TokenComponent } from './token.component';
import { UserService } from '../user/user.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import {CommonServiceModuleStub, AngularFireAuthStub} from '../core/common.module';
import { BehaviorSubject } from 'rxjs';

// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const AngularFirestoreStub = {
    collection: (name: string) => ({
      doc: (_id: string) => ({
        valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
        set: (_d: any) => new Promise((resolve, _reject) => resolve()),
      }),
    }),
  };


describe('TokenComponent', () => {
  let component: TokenComponent;
  let fixture: ComponentFixture<TokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, FormsModule, CommonServiceModuleStub ],
      schemas: [ NO_ERRORS_SCHEMA ],
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
