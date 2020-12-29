import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmHealthComponent } from './vm-health.component';


// TODO FIXME test
xdescribe('VmHealthComponent', () => {
  let component: VmHealthComponent;
  let fixture: ComponentFixture<VmHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VmHealthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VmHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
