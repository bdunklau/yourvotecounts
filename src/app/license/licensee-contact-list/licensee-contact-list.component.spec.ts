import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseeContactListComponent } from './licensee-contact-list.component';

describe('LicenseeContactListComponent', () => {
  let component: LicenseeContactListComponent;
  let fixture: ComponentFixture<LicenseeContactListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LicenseeContactListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseeContactListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
