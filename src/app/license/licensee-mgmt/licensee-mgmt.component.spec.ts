import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseeMgmtComponent } from './licensee-mgmt.component';

// TODO FIXME test
xdescribe('LicenseeMgmtComponent', () => {
  let component: LicenseeMgmtComponent;
  let fixture: ComponentFixture<LicenseeMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LicenseeMgmtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseeMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
