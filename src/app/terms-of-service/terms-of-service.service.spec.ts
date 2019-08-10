import { TestBed } from '@angular/core/testing';

import { TermsOfServiceService } from './terms-of-service.service';

describe('TermsOfServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TermsOfServiceService = TestBed.get(TermsOfServiceService);
    expect(service).toBeTruthy();
  });
});
