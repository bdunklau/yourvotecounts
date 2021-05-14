import { TestBed } from '@angular/core/testing';

import { FunctionalTestService } from './functional-test.service';

// TODO FIXME test
xdescribe('FunctionalTestService', () => {
  let service: FunctionalTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FunctionalTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
