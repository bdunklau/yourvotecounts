import { TestBed } from '@angular/core/testing';

import { VideoCallCompleteGuard } from './video-call-complete.guard';

// TODO FIXME test
xdescribe('VideoCallCompleteGuard', () => {
  let guard: VideoCallCompleteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VideoCallCompleteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
