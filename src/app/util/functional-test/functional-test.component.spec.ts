import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionalTestComponent } from './functional-test.component';

// TODO FIXME test
xdescribe('FunctionalTestComponent', () => {
  let component: FunctionalTestComponent;
  let fixture: ComponentFixture<FunctionalTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunctionalTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionalTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
