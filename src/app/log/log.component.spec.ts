import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import {CommonServiceModuleStub/*, AngularFirestoreStub*/} from '../core/common.module'
import { LogComponent } from './log.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs/observable/of';


describe('LogComponent', () => {
  let component: LogComponent;
  let fixture: ComponentFixture<LogComponent>;


  const AngularFirestoreStub = {
      collection: (name: string, f: (ref:any) => {}) => ({
        doc: (_id: string) => ({
          valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
          set: (_d: any) => new Promise((resolve, _reject) => resolve()),
        }),
        valueChanges: () => of([{id: '1', event: 'event1', date: {toDate: () => new Date()}}, // 2 mock LogEntry's
                                {id: '2', event: 'event2', date: {toDate: () => new Date()}}]),
        snapshotChanges: () => ({
          pipe: (xxx) => {}
        })
      }),
    };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      // imports: [CommonServiceModuleStub],
      declarations: [ LogComponent ],
      providers: [
                  { provide: AngularFirestore, useValue: AngularFirestoreStub }
                ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
