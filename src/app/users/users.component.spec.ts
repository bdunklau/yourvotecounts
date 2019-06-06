import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { UsersComponent } from './users.component';
import {CommonServiceModuleStub, AngularFirestoreStub} from '../core/common.module'

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonServiceModuleStub],
      declarations: [ UsersComponent ],
      providers: [
                  { provide: AngularFirestore, useClass: AngularFirestoreStub }
                ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
