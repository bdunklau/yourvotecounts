import { TestBed } from '@angular/core/testing';

import { SettingsGuard } from './settings.guard';

// TODO FIXME test
xdescribe('SettingsGuard', () => {
  let guard: SettingsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SettingsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
