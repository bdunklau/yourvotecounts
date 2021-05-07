import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseeFormComponent } from './licensee-form.component';

// TODO FIXME test
xdescribe('LicenseeFormComponent', () => {
    let component: LicenseeFormComponent;
    let fixture: ComponentFixture<LicenseeFormComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ LicenseeFormComponent ]
      })
      .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(LicenseeFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
});
