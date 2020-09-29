import { TestBed } from '@angular/core/testing';

import { InvitationFormGuard } from './invitation-form.guard';

// TODO FIXME test
xdescribe('InvitationFormGuard', () => {
  let guard: InvitationFormGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(InvitationFormGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
