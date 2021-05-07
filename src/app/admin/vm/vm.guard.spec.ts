import { TestBed } from '@angular/core/testing';

import { VmGuard } from './vm.guard';


// TODO FIXME test
xdescribe('VmGuard', () => {
  let guard: VmGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VmGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
