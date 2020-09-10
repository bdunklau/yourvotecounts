import { TestBed } from '@angular/core/testing';

import { VideoReadyGuard } from './video-ready.guard';

describe('VideoReadyGuard', () => {
  let guard: VideoReadyGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VideoReadyGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
