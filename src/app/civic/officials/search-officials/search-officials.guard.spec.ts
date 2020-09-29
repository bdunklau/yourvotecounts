import { TestBed } from '@angular/core/testing';

import { SearchOfficialsGuard } from './search-officials.guard';

// TODO FIXME test
xdescribe('SearchOfficialsGuard', () => {
  let guard: SearchOfficialsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SearchOfficialsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
