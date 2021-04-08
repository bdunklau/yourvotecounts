import { TestBed } from '@angular/core/testing';

import { CommitteeService } from './committee.service';


// TODO FIXME test
xdescribe('CommitteeService', () => {
  let service: CommitteeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommitteeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
