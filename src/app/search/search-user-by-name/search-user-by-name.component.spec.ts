import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchUserByNameComponent } from './search-user-by-name.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/#/getting-started
import { UserService } from '../../user/user.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';


describe('SearchUserByNameComponent', () => {
  let component: SearchUserByNameComponent;
  let fixture: ComponentFixture<SearchUserByNameComponent>;

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
      imports: [ /*CommonServiceModuleStub, */ FormsModule, NgbModule],
      declarations: [ SearchUserByNameComponent ],
      providers: [ UserService,
                  { provide: AngularFirestore, useValue: AngularFirestoreStub },
                  { provide: AngularFireAuth, useValue: {} },
                  { provide: HttpClient, useValue: {} } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchUserByNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
