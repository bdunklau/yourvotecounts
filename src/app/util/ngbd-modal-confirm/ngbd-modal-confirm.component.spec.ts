import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import {CommonServiceModuleStub, AngularFirestoreStub} from './core/common.module';
import { NgbdModalConfirmComponent } from './ngbd-modal-confirm.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('NgbdModalConfirmComponent', () => {
  let component: NgbdModalConfirmComponent;
  let fixture: ComponentFixture<NgbdModalConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgbdModalConfirmComponent ],
      providers: [NgbActiveModal
        // {provide: AngularFirestore, useClass: AngularFirestoreStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdModalConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
