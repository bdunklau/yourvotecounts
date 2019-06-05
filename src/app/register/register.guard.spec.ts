import { TestBed, async, inject } from '@angular/core/testing';
import { UserService } from '../core/user.service'
import { RegisterGuard } from './register.guard';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import {CommonServiceModuleStub, AngularFirestoreStub} from '../core/common.module'
import { CanActivate, Router } from "@angular/router";

describe('RegisterGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegisterGuard, UserService,
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); }  },
                  {provide: AngularFirestore, useClass: AngularFirestoreStub},
                {provide: AngularFireAuth, useClass: AngularFirestoreStub}]
    });
  });

  it('should ...', inject([RegisterGuard], (guard: RegisterGuard) => {
    expect(guard).toBeTruthy();
  }));
});
