import { TestBed } from '@angular/core/testing';

import { VideoCallGuard } from './video-call.guard';

// TODO FIXME test
xdescribe('VideoCallGuard', () => {
  let guard: VideoCallGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VideoCallGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
