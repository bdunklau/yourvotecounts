import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerAdComponent } from './banner-ad.component';

// TODO FIXME test
xdescribe('BannerAdComponent', () => {
  let component: BannerAdComponent;
  let fixture: ComponentFixture<BannerAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BannerAdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
