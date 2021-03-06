import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { InjectionToken } from '@angular/core';
import {CommonServiceModuleStub} from './core/common.module'
import { AuthService } from './core/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { UserService } from './user/user.service'
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';



describe('AppComponent', () => {

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


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [
        AppComponent
      ],
      providers: [AuthService, UserService, 
                  { provide: AngularFireStorage, useValue: {}},
                  { provide: HttpClient, useValue: {} },
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: AngularFireAuthStub }
                  ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    console.log('AppComponent: begin: 1')
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
    console.log('AppComponent: end: 1')
  });

  it(`should have as title 'HeadsUp'`, () => {
    console.log('AppComponent: begin: 2')
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('HeadsUp');
    console.log('AppComponent: end: 2')
  });

  it('should find title in the navbar', () => {
    console.log('AppComponent: begin: 3')
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('nav > a').textContent).toContain('HeadsUp');
    console.log('AppComponent: end: 3')
  });
});
