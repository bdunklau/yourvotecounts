import { TestBed } from '@angular/core/testing';

import { PromoCodeGuard } from './promo-code.guard';

// TODO FIXME test
xdescribe('PromoCodeGuard', () => {
  let guard: PromoCodeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PromoCodeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
