import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmMainComponent } from './vm-main.component';


// TODO FIXME test
xdescribe('VmMainComponent', () => {
    let component: VmMainComponent;
    let fixture: ComponentFixture<VmMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
          declarations: [ VmMainComponent ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VmMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
