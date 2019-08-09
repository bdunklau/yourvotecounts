import { TestBed, async, inject } from '@angular/core/testing';

import { MinimalAccountInfoGuard } from './minimal-account-info.guard';

describe('MinimalAccountInfoGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MinimalAccountInfoGuard]
    });
  });

  it('should ...', inject([MinimalAccountInfoGuard], (guard: MinimalAccountInfoGuard) => {
    expect(guard).toBeTruthy();
  }));
});
