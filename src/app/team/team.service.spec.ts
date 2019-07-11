import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { TeamService } from './team.service';


// a stub/mock
// FYI  https://github.com/angular/angularfire2/issues/1706#issuecomment-394212606
const FirestoreStub = {
    collection: (name: string) => ({
      doc: (_id: string) => ({
        valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
        set: (_d: any) => new Promise((resolve, _reject) => resolve()),
      }),
    }),
  };



describe('TeamService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
                {provide: AngularFirestore, useValue: FirestoreStub}
              ]
  }));

  it('should be created', () => {
    const service: TeamService = TestBed.get(TeamService);
    expect(service).toBeTruthy();
  });
});
