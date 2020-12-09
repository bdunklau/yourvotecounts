import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import {CommonServiceModuleStub, AngularFirestoreStub} from './core/common.module';
import { NgbdModalConfirmComponent } from './ngbd-modal-confirm.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';


describe('NgbdModalConfirmComponent', () => {
  let component: NgbdModalConfirmComponent;
  let fixture: ComponentFixture<NgbdModalConfirmComponent>;

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
      declarations: [ NgbdModalConfirmComponent ],
      providers: [NgbActiveModal,
                  {provide: AngularFirestore, useValue: AngularFirestoreStub},
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
    console.log('NgbdModalConfirmComponent: begin')
    expect(component).toBeTruthy();
    console.log('NgbdModalConfirmComponent: end')
  });
});
