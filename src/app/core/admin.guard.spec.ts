import { TestBed, async, inject } from '@angular/core/testing';
import { UserService } from '../user/user.service'
import { AdminGuard } from './admin.guard';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { Router } from "@angular/router";


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


//   // from:   https://atom-morgan.github.io/how-to-test-angular-canactivate-guards/
// class MockRouter {
//   navigate(path) {
//     console.log("MockRouter: path = ", path)
//   }
// }


describe('AdminGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminGuard, UserService,
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} },
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); }  },
                  { provide: HttpClient, useValue: {} }]
    });
  });

  it('should ...', inject([AdminGuard], (guard: AdminGuard) => {
    expect(guard).toBeTruthy();
  }));
});
