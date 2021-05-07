import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitationsComponent } from './invitations.component';
import { InvitationFormComponent } from '../invitation-form/invitation-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, of } from 'rxjs';
import { UserService } from '../../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';



// from:   https://atom-morgan.github.io/how-to-test-angular-canactivate-guards/
class MockRouter {
  navigate(path) {
    console.log("MockRouter: path = ", path)
  }

  getCurrentNavigation() {
      return {}
  }
}


describe('InvitationsComponent', () => {
  let component: InvitationsComponent;
  let fixture: ComponentFixture<InvitationsComponent>;
  

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
      imports: [ReactiveFormsModule, FormsModule, RouterTestingModule],
      declarations: [ InvitationsComponent, InvitationFormComponent ],
      providers: [ UserService,
        { provide: AngularFireStorage, useValue: {}},
        { provide: HttpClient, useValue: {} },
        { provide: AngularFireAuth, useValue: {} },
        { provide: Router, useClass: MockRouter },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('InvitationsComponent: begin')
    expect(component).toBeTruthy();
    console.log('InvitationsComponent: end')
  });
});
