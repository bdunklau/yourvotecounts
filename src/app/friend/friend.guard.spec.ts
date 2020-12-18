import { TestBed } from '@angular/core/testing';

import { FriendGuard } from './friend.guard';


// TODO FIXME test
xdescribe('FriendGuard', () => {
  let guard: FriendGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FriendGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
