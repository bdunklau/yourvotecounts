import { TestBed } from '@angular/core/testing';

import { InvitationDeletedGuard } from './invitation-deleted.guard';

// TODO FIXME test
xdescribe('InvitationDeletedGuard', () => {
  let guard: InvitationDeletedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(InvitationDeletedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
