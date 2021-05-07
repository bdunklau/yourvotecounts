import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseeListComponent } from './licensee-list.component';

// TODO FIXME test
xdescribe('LicenseeListComponent', () => {
  let component: LicenseeListComponent;
  let fixture: ComponentFixture<LicenseeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LicenseeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
