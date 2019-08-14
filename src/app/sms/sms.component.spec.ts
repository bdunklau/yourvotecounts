import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SmsComponent } from './sms.component';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/#/getting-started
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';

describe('SmsComponent', () => {
  let component: SmsComponent;
  let fixture: ComponentFixture<SmsComponent>;

    const AngularFirestoreStub = {
        collection: (name: string, f: (ref:any) => {}) => ({
          doc: (_id: string) => ({
            valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
            set: (_d: any) => new Promise((resolve, _reject) => resolve()),
          }),
          valueChanges: () => of([{id: '1', event: 'event1', date: {toDate: () => new Date()}}, // 2 mock LogEntry's
                                  {id: '2', event: 'event2', date: {toDate: () => new Date()}}])
        }),
      };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmsComponent ],
      imports: [ FormsModule, NgbModule],
      // I used 'useValue' because it is just a json. If it was class, I'd use 'useClass'
      providers: [
                  // UserService,
                  // { provide: HttpClient, useValue: {} },
                  // { provide: AngularFireAuth, useValue: {} },
                   {provide: AngularFirestore, useValue: AngularFirestoreStub},
                 ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
