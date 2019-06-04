import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { InjectionToken } from '@angular/core';
import {CommonServiceModuleStub, AngularFirestoreStub} from './core/common.module'

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [{provide: AngularFirestore, useClass: AngularFirestoreStub},
      //         { provide: InjectionToken, useClass: class { inject = jasmine.createSpy("inject"); }},
                  ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'YourVoteCounts'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('YourVoteCounts');
  });

  it('should find title in the navbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('nav > a').textContent).toContain('YourVoteCounts');
  });
});
