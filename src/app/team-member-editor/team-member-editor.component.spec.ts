import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchUserByName2Component } from '../search/search-user-by-name2/search-user-by-name2.component';
import { TeamMemberEditorComponent } from './team-member-editor.component';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/#/getting-started
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { UserService } from '../user/user.service';
import { HttpClient/*, HttpHeaders, HttpParams, HttpErrorResponse*/ } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, of } from 'rxjs';

// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const FirestoreStub = {
    collection: (name: string) => ({
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
    }),
  };



describe('TeamMemberEditorComponent', () => {
  let component: TeamMemberEditorComponent;
  let fixture: ComponentFixture<TeamMemberEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamMemberEditorComponent, SearchUserByName2Component ],
       imports: [ FormsModule, NgbModule],
       providers: [UserService,
                   { provide: AngularFireStorage, useValue: {}}, 
                   { provide: HttpClient, useValue: {} },
                   { provide: AngularFireAuth, useValue: {} },
                   {provide: AngularFirestore, useValue: FirestoreStub}
                 ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMemberEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
