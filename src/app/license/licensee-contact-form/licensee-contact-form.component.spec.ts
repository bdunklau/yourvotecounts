import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseeContactFormComponent } from './licensee-contact-form.component';

// TODO FIXME test
xdescribe('LicenseeContactFormComponent', () => {
    let component: LicenseeContactFormComponent;
    let fixture: ComponentFixture<LicenseeContactFormComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ LicenseeContactFormComponent ]
      })
      .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(LicenseeContactFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
});
