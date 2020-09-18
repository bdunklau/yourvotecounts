import { TestBed } from '@angular/core/testing';

import { VideoProducingGuard } from './video-producing.guard';

describe('VideoProducingGuard', () => {
  let guard: VideoProducingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VideoProducingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
