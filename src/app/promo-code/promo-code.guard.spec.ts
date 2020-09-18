import { TestBed } from '@angular/core/testing';

import { PromoCodeGuard } from './promo-code.guard';

describe('PromoCodeGuard', () => {
  let guard: PromoCodeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PromoCodeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
