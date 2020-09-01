import { TestBed } from '@angular/core/testing';

import { VideoCallCompleteGuard } from './video-call-complete.guard';

describe('VideoCallCompleteGuard', () => {
  let guard: VideoCallCompleteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VideoCallCompleteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
