import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import { TeamEditorComponent } from './team-editor.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonServiceModuleStub} from '../core/common.module';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Router } from "@angular/router";

// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const FirestoreStub = {
    collection: (name: string) => ({
      doc: (_id: string) => ({
        valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
        set: (_d: any) => new Promise((resolve, _reject) => resolve()),
      }),
    }),
  };


describe('TeamEditorComponent', () => {
  let component: TeamEditorComponent;
  let fixture: ComponentFixture<TeamEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamEditorComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      imports: [ FormsModule, NgbModule],
      providers: [UserService,
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                  {provide: HttpClient, useValue: {} },
                  { provide: AngularFireAuth, useValue: {} },
                  {provide: AngularFirestore, useValue: FirestoreStub},
                  {provide: ActivatedRoute,
                    useValue: {
                      params: Observable.from([{id: 1}]),
                      data: { "mock2": "mock2", subscribe: () => {} }
                    },
                  },
                ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
