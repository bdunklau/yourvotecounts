import { TestBed } from '@angular/core/testing';

import { OfficialsService } from './officials.service';

// TODO FIXME test
xdescribe('OfficialsService', () => {
  let service: OfficialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
